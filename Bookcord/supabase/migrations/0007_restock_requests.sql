-- ===============================================================
-- 0007: Student restock requests for out-of-stock titles
--
-- * When every copy of a title is out, a student can ask the
--   library to restock it. One open request per student per
--   title; the librarian sees them on the inventory page.
-- * Any restock through the audited restock_book RPC resolves
--   every pending request for that title automatically.
-- ===============================================================

create table if not exists public.restock_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'RESTOCKED', 'DISMISSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Only one open request per student per title.
create unique index if not exists restock_requests_one_open_per_book
  on public.restock_requests (profile_id, book_id)
  where status = 'PENDING';

create index if not exists restock_requests_book_idx on public.restock_requests(book_id);
create index if not exists restock_requests_status_idx on public.restock_requests(status);

drop trigger if exists restock_requests_set_updated_at on public.restock_requests;

create trigger restock_requests_set_updated_at
before update on public.restock_requests
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.restock_requests enable row level security;

create policy "restock requests read own or admin"
  on public.restock_requests for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "restock requests insert own"
  on public.restock_requests for insert
  with check (public.is_self(profile_id));
create policy "restock requests update admin"
  on public.restock_requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- Students may only request titles that are actually out of stock;
-- librarians keep their bypass for edge cases.
create or replace function public.protect_restock_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if exists (
    select 1
    from public.inventory
    where book_id = new.book_id
      and available_stock > 0
  ) then
    raise exception 'This title is not out of stock.';
  end if;

  return new;
end $$;

drop trigger if exists restock_requests_protect on public.restock_requests;

create trigger restock_requests_protect
before insert on public.restock_requests
for each row execute function public.protect_restock_request();

-- ---------------------------------------------------------------
-- Restocking a title resolves every pending request for it, no
-- matter which desk flow added the copies. restock_book is
-- redeclared here with just that one addition (see 0001).
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

  -- Fresh copies close every pending student request for this title.
  update public.restock_requests
  set status = 'RESTOCKED',
      resolved_at = now()
  where book_id = p_book_id
    and status = 'PENDING';

  return v_restock_id;
end;
$$;
