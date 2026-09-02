-- =============================================================
-- Bookcord: School Book Stock Management System
-- Initial schema, RLS, inventory RPCs, and seed data
-- Run this in the Supabase SQL editor or via supabase db push
-- =============================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'role_name'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.role_name as enum ('ADMIN', 'USER');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'profile_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.profile_status as enum ('ACTIVE', 'DISABLED');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'movement_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.movement_type as enum ('RESTOCK', 'ISSUE', 'RETURN', 'ADJUSTMENT');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'issue_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.issue_status as enum ('ISSUED', 'RETURNED', 'PARTIALLY_RETURNED');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'return_condition'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.return_condition as enum ('GOOD', 'FAIR', 'DAMAGED', 'LOST');
  end if;
end $$;

-- ---------------------------------------------------------------
-- ---------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.role_name not null unique,
  created_at timestamptz not null default now()
);

insert into public.roles (name) values ('ADMIN'), ('USER')
on conflict (name) do nothing;

-- ---------------------------------------------------------------
-- Academic reference tables
-- ---------------------------------------------------------------
create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.strands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.year_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

-- ---------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text,
  email text not null,
  year_level_id uuid references public.year_levels(id) on delete set null,
  strand_id uuid references public.strands(id) on delete set null,
  role public.role_name not null default 'USER',
  status public.profile_status not null default 'ACTIVE',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper RLS functions
-- ---------------------------------------------------------------
create or replace function public.get_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role = 'ADMIN'
      and status = 'ACTIVE'
  );
$$;

create or replace function public.is_self(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_current_profile_id() is not null
    and public.get_current_profile_id() = profile_id;
$$;


create unique index profiles_student_id_unique
  on public.profiles (lower(student_id))
  where student_id is not null;

-- ---------------------------------------------------------------
-- Books and inventory
-- ---------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  isbn text unique,
  author_id uuid references public.authors(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  description text,
  cover_image_url text,
  semester_id uuid references public.semesters(id) on delete set null,
  strand_id uuid references public.strands(id) on delete set null,
  year_level_id uuid references public.year_levels(id) on delete set null,
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index books_title_idx on public.books using gin (title gin_trgm_ops);
create index books_created_at_idx on public.books (created_at desc);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null unique references public.books(id) on delete cascade,
  total_stock integer not null default 0 check (total_stock >= 0),
  available_stock integer not null default 0 check (available_stock >= 0),
  issued_stock integer not null default 0 check (issued_stock >= 0),
  updated_at timestamptz not null default now(),
  check (available_stock <= total_stock),
  check (issued_stock <= total_stock)
);

create index inventory_book_idx on public.inventory (book_id);

-- ---------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------
create table public.restocks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  restock_date timestamptz not null default now(),
  supplier text,
  reference_number text,
  cost_per_book numeric(12, 2) check (cost_per_book is null or cost_per_book >= 0),
  total_cost numeric(14, 2) check (total_cost is null or total_cost >= 0),
  notes text,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index restocks_book_date_idx on public.restocks (book_id, restock_date desc);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  movement_type public.movement_type not null,
  quantity_change integer not null check (quantity_change <> 0),
  reference_id uuid,
  reference_table text,
  reason text,
  notes text,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_movements_book_date_idx
  on public.stock_movements (book_id, created_at desc);
create index stock_movements_type_date_idx
  on public.stock_movements (movement_type, created_at desc);

create table public.book_issues (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  returned_quantity integer not null default 0 check (returned_quantity >= 0),
  date_issued timestamptz not null default now(),
  expected_return_date date,
  notes text,
  status public.issue_status not null default 'ISSUED',
  issued_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (returned_quantity <= quantity)
);

create index book_issues_profile_idx on public.book_issues (profile_id, date_issued desc);
create index book_issues_book_idx on public.book_issues (book_id, date_issued desc);

create table public.book_returns (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.book_issues(id) on delete restrict,
  book_id uuid not null references public.books(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  date_returned timestamptz not null default now(),
  condition public.return_condition not null default 'GOOD',
  notes text,
  processed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index book_returns_issue_idx on public.book_returns (issue_id, date_returned desc);
create index book_returns_book_date_idx on public.book_returns (book_id, date_returned desc);

-- ---------------------------------------------------------------
-- Timestamp maintenance
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

create trigger inventory_set_updated_at
before update on public.inventory
for each row execute function public.set_updated_at();

create trigger book_issues_set_updated_at
before update on public.book_issues
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Registration role hardening
-- A client can never insert a privileged profile row.
-- ---------------------------------------------------------------
create or replace function public.enforce_registration_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> 'USER' then
    new.role := 'USER';
  end if;
  new.status := coalesce(new.status, 'ACTIVE');
  return new;
end;
$$;

create trigger profiles_enforce_registration_role
before insert on public.profiles
for each row execute function public.enforce_registration_role();

create or replace function public.prevent_self_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.student_id is distinct from old.student_id then
      raise exception 'You are not allowed to change role, status, or student ID.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_self_privilege_change
before update on public.profiles
for each row execute function public.prevent_self_privilege_change();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.books enable row level security;
alter table public.authors enable row level security;
alter table public.subjects enable row level security;
alter table public.strands enable row level security;
alter table public.semesters enable row level security;
alter table public.year_levels enable row level security;
alter table public.inventory enable row level security;
alter table public.restocks enable row level security;
alter table public.stock_movements enable row level security;
alter table public.book_issues enable row level security;
alter table public.book_returns enable row level security;

-- Profiles
create policy "profiles select own or admin"
  on public.profiles for select
  using (public.is_admin() or public.is_self(id));

create policy "profiles insert self"
  on public.profiles for insert
  with check (auth.uid() = auth_user_id);

create policy "profiles update own or admin"
  on public.profiles for update
  using (public.is_admin() or public.is_self(id));

create policy "profiles delete admin"
  on public.profiles for delete
  using (public.is_admin());

-- Roles (read only reference)
create policy "roles read authenticated"
  on public.roles for select
  using (auth.role() = 'authenticated');

-- Books
create policy "books read authenticated"
  on public.books for select
  using (auth.role() = 'authenticated');
create policy "books insert admin"
  on public.books for insert
  with check (public.is_admin());
create policy "books update admin"
  on public.books for update
  using (public.is_admin());
create policy "books delete admin"
  on public.books for delete
  using (public.is_admin());

-- Academic reference data
create policy "authors read authenticated"
  on public.authors for select using (auth.role() = 'authenticated');
create policy "authors write admin"
  on public.authors for all using (public.is_admin()) with check (public.is_admin());

create policy "subjects read authenticated"
  on public.subjects for select using (auth.role() = 'authenticated');
create policy "subjects write admin"
  on public.subjects for all using (public.is_admin()) with check (public.is_admin());

create policy "strands read authenticated"
  on public.strands for select using (auth.role() = 'authenticated');
create policy "strands write admin"
  on public.strands for all using (public.is_admin()) with check (public.is_admin());

create policy "semesters read authenticated"
  on public.semesters for select using (auth.role() = 'authenticated');
create policy "semesters write admin"
  on public.semesters for all using (public.is_admin()) with check (public.is_admin());

create policy "year levels read authenticated"
  on public.year_levels for select using (auth.role() = 'authenticated');
create policy "year levels write admin"
  on public.year_levels for all using (public.is_admin()) with check (public.is_admin());

-- Inventory
create policy "inventory read authenticated"
  on public.inventory for select using (auth.role() = 'authenticated');
create policy "inventory write admin"
  on public.inventory for all using (public.is_admin()) with check (public.is_admin());

-- Restocks
create policy "restocks read admin"
  on public.restocks for select using (public.is_admin());
create policy "restocks write admin"
  on public.restocks for all using (public.is_admin()) with check (public.is_admin());

-- Stock movements
create policy "stock movements read admin"
  on public.stock_movements for select using (public.is_admin());
create policy "stock movements write admin"
  on public.stock_movements for all using (public.is_admin()) with check (public.is_admin());

-- Issues
create policy "issues read admin or own"
  on public.book_issues for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "issues write admin"
  on public.book_issues for all using (public.is_admin()) with check (public.is_admin());

-- Returns
create policy "returns read admin or own"
  on public.book_returns for select
  using (public.is_admin() or public.is_self(profile_id));
create policy "returns write admin"
  on public.book_returns for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------
-- Atomic inventory RPCs
-- These functions bypass RLS but validate the actor is an admin.
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

  return v_restock_id;
end;
$$;

create or replace function public.issue_book(
  p_book_id uuid,
  p_profile_id uuid,
  p_quantity integer,
  p_expected_return_date date default null,
  p_notes text default null,
  p_date_issued timestamptz default now()
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_issue_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Issue quantity must be greater than zero';
  end if;

  select id into v_actor from public.profiles where auth_user_id = auth.uid();

  perform 1 from public.profiles where id = p_profile_id for update;
  if not found then
    raise exception 'Student profile not found';
  end if;

  update public.inventory
  set available_stock = available_stock - p_quantity,
      issued_stock = issued_stock + p_quantity,
      updated_at = now()
  where book_id = p_book_id
    and available_stock >= p_quantity;

  if not found then
    raise exception 'Not enough available stock';
  end if;

  insert into public.book_issues (
    book_id, profile_id, quantity, date_issued,
    expected_return_date, notes, issued_by
  ) values (
    p_book_id, p_profile_id, p_quantity, coalesce(p_date_issued, now()),
    p_expected_return_date, p_notes, v_actor
  )
  returning id into v_issue_id;

  insert into public.stock_movements (
    book_id, movement_type, quantity_change, reference_id, reference_table, notes, performed_by
  ) values (
    p_book_id, 'ISSUE', -p_quantity, v_issue_id, 'book_issues', p_notes, v_actor
  );

  return v_issue_id;
end;
$$;

create or replace function public.return_book(
  p_issue_id uuid,
  p_quantity integer,
  p_condition public.return_condition default 'GOOD',
  p_notes text default null,
  p_date_returned timestamptz default now()
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_issue public.book_issues%rowtype;
  v_return_id uuid;
  v_remaining integer;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Return quantity must be greater than zero';
  end if;

  select id into v_actor from public.profiles where auth_user_id = auth.uid();

  select * into v_issue
  from public.book_issues
  where id = p_issue_id
  for update;

  if not found then
    raise exception 'Issue record not found';
  end if;

  v_remaining := v_issue.quantity - v_issue.returned_quantity;
  if p_quantity > v_remaining then
    raise exception 'Return quantity exceeds the remaining issued quantity';
  end if;

  update public.book_issues
  set returned_quantity = returned_quantity + p_quantity,
      status = case
        when returned_quantity + p_quantity >= quantity then 'RETURNED'
        else 'PARTIALLY_RETURNED'
      end,
      updated_at = now()
  where id = p_issue_id;

  update public.inventory
  set available_stock = available_stock + p_quantity,
      issued_stock = greatest(issued_stock - p_quantity, 0),
      updated_at = now()
  where book_id = v_issue.book_id;

  insert into public.book_returns (
    issue_id, book_id, profile_id, quantity, date_returned,
    condition, notes, processed_by
  ) values (
    p_issue_id, v_issue.book_id, v_issue.profile_id, p_quantity,
    coalesce(p_date_returned, now()), coalesce(p_condition, 'GOOD'),
    p_notes, v_actor
  )
  returning id into v_return_id;

  insert into public.stock_movements (
    book_id, movement_type, quantity_change, reference_id, reference_table, notes, performed_by
  ) values (
    v_issue.book_id, 'RETURN', p_quantity, v_return_id, 'book_returns', p_notes, v_actor
  );

  return v_return_id;
end;
$$;

create or replace function public.adjust_inventory(
  p_book_id uuid,
  p_quantity_change integer,
  p_reason text,
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_movement_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;
  if p_quantity_change is null or p_quantity_change = 0 then
    raise exception 'Adjustment quantity cannot be zero';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Adjustment reason is required';
  end if;

  select id into v_actor from public.profiles where auth_user_id = auth.uid();

  update public.inventory
  set total_stock = total_stock + p_quantity_change,
      available_stock = available_stock + p_quantity_change,
      updated_at = now()
  where book_id = p_book_id
    and total_stock + p_quantity_change >= 0
    and available_stock + p_quantity_change >= 0;

  if not found then
    raise exception 'Adjustment would make inventory negative';
  end if;

  insert into public.stock_movements (
    book_id, movement_type, quantity_change, reason, notes, performed_by
  ) values (
    p_book_id, 'ADJUSTMENT', p_quantity_change, p_reason, p_notes, v_actor
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

-- ---------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------
grant execute on function public.restock_book(uuid, integer, text, text, numeric, text, timestamptz) to authenticated;
grant execute on function public.issue_book(uuid, uuid, integer, date, text, timestamptz) to authenticated;
grant execute on function public.return_book(uuid, integer, public.return_condition, text, timestamptz) to authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text, text) to authenticated;

-- ---------------------------------------------------------------
-- Seed reference data
-- ---------------------------------------------------------------
insert into public.semesters (name) values
  ('1st Semester'),
  ('2nd Semester')
on conflict (name) do nothing;

insert into public.strands (name) values
  ('STEM'),
  ('ABM'),
  ('HUMSS'),
  ('GAS'),
  ('TVL'),
  ('Arts and Design'),
  ('Sports')
on conflict (name) do nothing;

insert into public.year_levels (name, sort_order) values
  ('Grade 11', 1),
  ('Grade 12', 2)
on conflict (name) do nothing;

insert into public.subjects (name) values
  ('Mathematics'),
  ('Science'),
  ('English'),
  ('Filipino'),
  ('Accounting'),
  ('Programming'),
  ('Research')
on conflict (name) do nothing;

insert into public.authors (name) values
  ('Rex Bookstore'),
  ('Vibal Publishing'),
  ('Phoenix Publishing House'),
  ('Cengage Learning'),
  ('Jose Rizal'),
  ('Juan dela Cruz'),
  ('Maria Santos')
on conflict (name) do nothing;
