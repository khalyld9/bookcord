-- ===============================================================
-- 0005: Reserve + checkout flow, ICT-only strands, avatar uploads
--
-- * Reservations replace the old borrow/hold wording: a student
--   reserves a book, gets a claim code + QR, and a librarian scans
--   the QR (or types the code) to mark it CLAIMED at the desk.
-- * Strands are limited to ICT; year levels to Grade 11 and 12.
-- * Creates the public `avatars` storage bucket for profile
--   picture uploads.
-- ===============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type public.reservation_status as enum (
      'PENDING',
      'READY',
      'CLAIMED',
      'RETURNED',
      'CANCELLED'
    );
  end if;
end $$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  status public.reservation_status not null default 'PENDING',
  code text not null unique default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  claimed_at timestamptz
);

-- Only one open reservation per student per title.
create unique index if not exists reservations_one_open_per_book
  on public.reservations (profile_id, book_id)
  where status in ('PENDING', 'READY');

create index if not exists reservations_book_idx on public.reservations(book_id);
create index if not exists reservations_profile_status_idx on public.reservations(profile_id, status);

drop trigger if exists reservations_set_updated_at on public.reservations;

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.reservations enable row level security;

create policy "reservations read own or admin"
  on public.reservations for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "reservations insert own"
  on public.reservations for insert
  with check (public.is_self(profile_id));
create policy "reservations update own or admin"
  on public.reservations for update
  using (public.is_admin() or public.is_self(profile_id))
  with check (public.is_admin() or public.is_self(profile_id));

-- Students may only cancel their own open reservation; librarians
-- drive the rest of the lifecycle (claim, return, etc.).
create or replace function public.protect_reservation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'PENDING' then
      raise exception 'Reservations always start as pending.';
    end if;
    return new;
  end if;

  if new.profile_id is distinct from old.profile_id
    or new.book_id is distinct from old.book_id
    or new.code is distinct from old.code then
    raise exception 'A reservation cannot be moved to another account or title.';
  end if;

  if old.status not in ('PENDING', 'READY') then
    raise exception 'This reservation is already closed.';
  end if;

  if new.status <> 'CANCELLED' then
    raise exception 'You can only cancel your own reservation.';
  end if;

  new.claimed_at := null;
  return new;
end $$;

drop trigger if exists reservations_protect on public.reservations;

create trigger reservations_protect
before insert or update on public.reservations
for each row execute function public.protect_reservation();

-- ---------------------------------------------------------------
-- Reference data: ICT strand only, Grade 11 and Grade 12 only.
-- Archiving keeps existing book rows intact while hiding the rest
-- from every picker (data layer filters on archived_at is null).
-- ---------------------------------------------------------------
insert into public.strands (name)
values ('ICT')
on conflict (name) do update set archived_at = null;

update public.strands
set archived_at = now()
where name <> 'ICT';

update public.year_levels
set archived_at = now()
where name not in ('Grade 11', 'Grade 12');

-- ---------------------------------------------------------------
-- Avatar uploads
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');
