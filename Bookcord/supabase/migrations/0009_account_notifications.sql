-- ===============================================================
-- 0009: Account and password-security notifications
-- Run after 0008_notifications.sql.
-- ===============================================================

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'ACCOUNT_CREATED',
      'PASSWORD_RESET',
      'PASSWORD_CHANGED',
      'RESTOCK_REQUEST',
      'RESTOCK_RESOLVED',
      'RESERVATION_READY'
    )
  );

create or replace function public.on_profile_created_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (profile_id, type, title, body, href)
  values (
    new.id,
    'ACCOUNT_CREATED',
    'Welcome to Bookcords',
    'Your bookstore account is ready. Start browsing the catalog.',
    '/books'
  );
  return new;
end $$;

drop trigger if exists profiles_notify_created on public.profiles;

create trigger profiles_notify_created
after insert on public.profiles
for each row execute function public.on_profile_created_notification();

-- Service-role calls originate from the verified six-digit admin session.
-- Treat them as administrative for the existing audited RPCs.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'service_role' or exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role = 'ADMIN'
      and status = 'ACTIVE'
  );
$$;
