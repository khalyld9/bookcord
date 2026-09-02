-- =============================================================
-- Bookcord: Booky chat
-- A student <-> librarian message thread, plus a narrow RPC so
-- Booky can answer "what is restocking?" without exposing the
-- admin-only restocks table.
-- Run after 0001_init.sql.
-- =============================================================

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'chat_sender'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.chat_sender as enum ('STUDENT', 'ADMIN');
  end if;
end $$;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sender public.chat_sender not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_profile_time
  on public.chat_messages (profile_id, created_at asc);

alter table public.chat_messages enable row level security;

create policy "chat read own or admin"
  on public.chat_messages for select
  using (public.is_admin() or public.is_self(profile_id));

create policy "chat student sends own"
  on public.chat_messages for insert
  with check (public.is_self(profile_id) and sender = 'STUDENT');

create policy "chat admin sends"
  on public.chat_messages for insert
  with check (public.is_admin() and sender = 'ADMIN');

-- ---------------------------------------------------------------
-- Booky FAQ: upcoming restocks.
-- `restocks` is admin-only, so students get this narrow, definer
-- owned window instead: titles, subjects, quantities and dates.
-- ---------------------------------------------------------------
create or replace function public.upcoming_restocks(p_limit integer default 5)
returns table (
  title text,
  subject text,
  quantity integer,
  restock_date timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.title::text,
    s.name::text,
    r.quantity,
    r.restock_date
  from public.restocks r
  join public.books b on b.id = r.book_id
  left join public.subjects s on s.id = b.subject_id
  where r.restock_date >= now()
  order by r.restock_date asc
  limit greatest(coalesce(p_limit, 5), 1);
$$;

revoke all on function public.upcoming_restocks(integer) from public;
grant execute on function public.upcoming_restocks(integer) to authenticated;
