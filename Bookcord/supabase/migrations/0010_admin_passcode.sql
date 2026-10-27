-- Store the admin passcode as a server-readable hash instead of relying on a
-- deployment environment variable. Browser roles receive no table access.
create table if not exists public.app_settings (
  key text primary key,
  value_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
revoke all on table public.app_settings from anon, authenticated;

insert into public.app_settings (key, value_hash, updated_at)
values (
  'admin_passcode',
  encode(digest('123456', 'sha256'), 'hex'),
  now()
)
on conflict (key) do update
set value_hash = excluded.value_hash,
    updated_at = now();
