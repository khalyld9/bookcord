-- ===============================================================
-- 0012: Complete restock notification coverage
--
-- * Students receive an acknowledgement as soon as they request a
--   restock.
-- * Any inventory change that takes a title from out of stock to
--   available resolves pending requests and notifies each student.
--   This covers restocks, corrections, and returned copies.
-- ===============================================================

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

  insert into public.notifications (profile_id, type, title, body, href)
  values (
    new.profile_id,
    'RESTOCK_REQUEST',
    'Restock request received',
    'We will notify you when ' || v_title || ' is back in stock.',
    '/books/' || new.book_id::text
  );

  perform public.notify_every_admin(
    'RESTOCK_REQUEST',
    'Restock requested',
    v_student || ' asked for ' || v_title || ', every copy is out.',
    '/admin/inventory'
  );
  return new;
end $$;

create or replace function public.on_inventory_available()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if new.available_stock <= 0 then
    return new;
  end if;

  if tg_op = 'UPDATE' and coalesce(old.available_stock, 0) > 0 then
    return new;
  end if;

  select coalesce(title, 'A title you requested') into v_title
    from public.books where id = new.book_id;

  with resolved as (
    update public.restock_requests
    set status = 'RESTOCKED',
        resolved_at = now()
    where book_id = new.book_id
      and status = 'PENDING'
    returning profile_id
  )
  insert into public.notifications (profile_id, type, title, body, href)
  select resolved.profile_id,
         'RESTOCK_RESOLVED',
         'Back in stock',
         v_title || ' is available again. Reserve your copy now.',
         '/books/' || new.book_id::text
  from resolved;

  return new;
end $$;

drop trigger if exists inventory_notify_available on public.inventory;

create trigger inventory_notify_available
after insert or update of available_stock on public.inventory
for each row execute function public.on_inventory_available();

