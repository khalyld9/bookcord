-- ===============================================================
-- 0008: Notifications for students and librarians
--
-- * A notifications row per recipient; recipients read their own
--   and can only mark them read. Creation happens inside security
--   definer triggers/RPCs, so no client insert policy at all.
-- * Wired flows:
--     - a student requests a restock  -> every active librarian
--     - a restock resolves requests   -> each requesting student
--     - a reservation becomes READY   -> the student
-- ===============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (
    type in ('RESTOCK_REQUEST', 'RESTOCK_RESOLVED', 'RESERVATION_READY')
  ),
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_created_idx
  on public.notifications (profile_id, created_at desc);
create index if not exists notifications_profile_unread_idx
  on public.notifications (profile_id)
  where read_at is null;

-- ---------------------------------------------------------------
-- Row Level Security: recipients read their own and may only flip
-- read_at. Everything else is written by definer functions.
-- ---------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "notifications read own"
  on public.notifications for select
  using (public.is_self(profile_id));
create policy "notifications mark read own"
  on public.notifications for update
  using (public.is_self(profile_id))
  with check (public.is_self(profile_id));

create or replace function public.protect_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.profile_id is distinct from old.profile_id
    or new.type is distinct from old.type
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.href is distinct from old.href
    or new.created_at is distinct from old.created_at then
    raise exception 'Only read_at may change on a notification.';
  end if;
  return new;
end $$;

drop trigger if exists notifications_protect on public.notifications;

create trigger notifications_protect
before update on public.notifications
for each row execute function public.protect_notification();

-- ---------------------------------------------------------------
-- Fan-out helper: one notification per active librarian.
-- ---------------------------------------------------------------
create or replace function public.notify_every_admin(
  p_type text,
  p_title text,
  p_body text,
  p_href text
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (profile_id, type, title, body, href)
  select id, p_type, p_title, p_body, p_href
  from public.profiles
  where role = 'ADMIN'
    and status = 'ACTIVE';
$$;

-- Student asks for a restock -> librarians hear about it.
create or replace function public.on_restock_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student text;
  v_title text;
begin
  select coalesce(full_name, 'A student') into v_student
    from public.profiles where id = new.profile_id;
  select coalesce(title, 'a title') into v_title
    from public.books where id = new.book_id;

  perform public.notify_every_admin(
    'RESTOCK_REQUEST',
    'Restock requested',
    v_student || ' asked for ' || v_title || ', every copy is out.',
    '/admin/inventory'
  );
  return new;
end $$;

drop trigger if exists restock_requests_notify on public.restock_requests;

create trigger restock_requests_notify
after insert on public.restock_requests
for each row execute function public.on_restock_request_created();

-- A reservation becomes READY -> the student hears their copy is set aside.
create or replace function public.on_reservation_ready()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if new.status = 'READY' and old.status <> 'READY' then
    select coalesce(title, 'your title') into v_title
      from public.books where id = new.book_id;

    insert into public.notifications (profile_id, type, title, body, href)
    values (
      new.profile_id,
      'RESERVATION_READY',
      'Reservation ready',
      v_title || ' is set aside for you, show your QR at the counter.',
      '/my-books'
    );
  end if;
  return new;
end $$;

drop trigger if exists reservations_notify_ready on public.reservations;

create trigger reservations_notify_ready
after update on public.reservations
for each row execute function public.on_reservation_ready();

-- ---------------------------------------------------------------
-- restock_book gains the student notifications on top of the
-- request resolution added in 0007. Declared cumulatively.
-- ---------------------------------------------------------------
create or replace function public.restock_book(
  p_book_id uuid,
  p_quantity integer,
  p_supplier text default null,
  p_reference_number text default null,
  p_cost_per_book numeric default null,
  p_notes text default null,
  p_restock_date timestamptz default now()
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_restock_id uuid;
  v_total_cost numeric;
  v_title text;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Restock quantity must be greater than zero';
  end if;

  select id into v_actor from public.profiles where auth_user_id = auth.uid();

  v_total_cost := case
    when p_cost_per_book is null then null
    else p_cost_per_book * p_quantity
  end;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  values (p_book_id, p_quantity, p_quantity, 0)
  on conflict (book_id) do update
  set total_stock = public.inventory.total_stock + excluded.total_stock,
      available_stock = public.inventory.available_stock + excluded.available_stock,
      updated_at = now();

  insert into public.restocks (
    book_id, quantity, restock_date, supplier, reference_number,
    cost_per_book, total_cost, notes, added_by
  ) values (
    p_book_id, p_quantity, coalesce(p_restock_date, now()), p_supplier,
    p_reference_number, p_cost_per_book, v_total_cost, p_notes, v_actor
  )
  returning id into v_restock_id;

  insert into public.stock_movements (
    book_id, movement_type, quantity_change, reference_id, reference_table, notes, performed_by
  ) values (
    p_book_id, 'RESTOCK', p_quantity, v_restock_id, 'restocks', p_notes, v_actor
  );

  select coalesce(title, 'A title you asked for') into v_title
    from public.books where id = p_book_id;

  -- Fresh copies close every pending student request for this title,
  -- and each student who asked gets told their wait paid off.
  with resolved as (
    update public.restock_requests
    set status = 'RESTOCKED',
        resolved_at = now()
    where book_id = p_book_id
      and status = 'PENDING'
    returning profile_id
  )
  insert into public.notifications (profile_id, type, title, body, href)
  select resolved.profile_id,
         'RESTOCK_RESOLVED',
         'Back in stock',
         v_title || ' is back on the shelf, reserve your copy.',
         '/books/' || p_book_id::text
  from resolved;

  return v_restock_id;
end;
$$;
