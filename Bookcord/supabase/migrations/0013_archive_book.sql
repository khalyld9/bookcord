-- ===============================================================
-- 0013: Safe admin book deletion
--
-- Books are archived instead of physically removed so checkout,
-- return, and stock history remain auditable. The title disappears
-- from active catalog and inventory queries immediately.
-- ===============================================================

create or replace function public.archive_book(p_book_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;

  select title into v_title
  from public.books
  where id = p_book_id
    and archived_at is null
  for update;

  if v_title is null then
    raise exception 'That book does not exist or was already deleted.';
  end if;

  if exists (
    select 1 from public.reservations
    where book_id = p_book_id
      and status in ('PENDING', 'READY')
  ) then
    raise exception 'Cancel or complete active reservations before deleting this book.';
  end if;

  if exists (
    select 1 from public.book_issues
    where book_id = p_book_id
      and returned_quantity < quantity
  ) then
    raise exception 'Check in every issued copy before deleting this book.';
  end if;

  update public.restock_requests
  set status = 'DISMISSED',
      resolved_at = now()
  where book_id = p_book_id
    and status = 'PENDING';

  delete from public.saved_books where book_id = p_book_id;
  delete from public.hold_requests where book_id = p_book_id;

  update public.books
  set archived_at = now(),
      cover_image_url = null,
      updated_at = now()
  where id = p_book_id;

  return v_title;
end;
$$;

grant execute on function public.archive_book(uuid) to authenticated;

