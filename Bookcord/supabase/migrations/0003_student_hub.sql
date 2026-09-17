-- =============================================================
-- Bookcord: Student hub
-- Saved books (wishlist) and hold requests, with RLS.
-- Run after 0001_init.sql. Reuses the existing is_self() / is_admin()
-- helpers and the set_updated_at() trigger function.
-- =============================================================

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'hold_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.hold_status as enum (
      'PENDING', 'READY', 'FULFILLED', 'CANCELLED', 'EXPIRED'
    );
  end if;
end $$;

-- ---------------------------------------------------------------
-- Saved books (wishlist)
-- ---------------------------------------------------------------
create table if not exists public.saved_books (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  constraint saved_books_profile_book_unique unique (profile_id, book_id)
);

create index if not exists saved_books_profile_idx
  on public.saved_books (profile_id, created_at desc);

-- ---------------------------------------------------------------
-- Hold requests
-- A student queues for a copy that is currently out; the librarian
-- moves it through READY -> FULFILLED.
-- ---------------------------------------------------------------
create table if not exists public.hold_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status public.hold_status not null default 'PENDING',
  needed_by date,
  note text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create index if not exists hold_requests_profile_idx
  on public.hold_requests (profile_id, requested_at desc);
create index if not exists hold_requests_book_idx
  on public.hold_requests (book_id, requested_at asc);

-- Only one open request per student per title; closed ones stay as history.
create unique index if not exists hold_requests_one_open_per_book
  on public.hold_requests (profile_id, book_id)
  where status in ('PENDING', 'READY');

create trigger hold_requests_set_updated_at
before update on public.hold_requests
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.saved_books enable row level security;
alter table public.hold_requests enable row level security;

create policy "saved books read own or admin"
  on public.saved_books for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "saved books insert own"
  on public.saved_books for insert
  with check (public.is_self(profile_id));
create policy "saved books delete own"
  on public.saved_books for delete
  using (public.is_self(profile_id));

create policy "holds read own or admin"
  on public.hold_requests for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "holds insert own"
  on public.hold_requests for insert
  with check (public.is_self(profile_id));
create policy "holds update own or admin"
  on public.hold_requests for update
  using (public.is_admin() or public.is_self(profile_id))
  with check (public.is_admin() or public.is_self(profile_id));

-- ---------------------------------------------------------------
-- Students may only cancel their own hold; librarians drive the rest.
-- ---------------------------------------------------------------
create or replace function public.protect_hold_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.profile_id is distinct from old.profile_id
    or new.book_id is distinct from old.book_id then
    raise exception 'A hold request cannot be moved to another account or title.';
  end if;

  if old.status in ('FULFILLED', 'CANCELLED', 'EXPIRED') then
    raise exception 'This hold request is already closed.';
  end if;

  if new.status <> 'CANCELLED' then
    raise exception 'You can only cancel your own hold request.';
  end if;

  new.fulfilled_at := null;
  return new;
end $$;

drop trigger if exists hold_requests_protect on public.hold_requests;

create trigger hold_requests_protect
before update on public.hold_requests
for each row execute function public.protect_hold_request();
