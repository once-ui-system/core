-- Acme Notes — Supabase schema.
-- Run this in your project's SQL editor before setting the env vars in
-- .env.example. Idempotent: safe to re-run.
--
-- ONE PROJECT PER APP. The tables below are unprefixed (profiles, roles,
-- user_global_roles) and the trigger fires on every auth.users insert, so this
-- file assumes the Supabase project belongs to this app alone. An app joining
-- a project that other products already share must not run it: prefix its
-- own tables (<app>_profiles), create per-user rows lazily from the route
-- that first needs them instead of a trigger on auth.users, and drop the
-- role tables unless the product uses them.
--
-- Access model: RLS is enabled with NO member policies. All reads/writes go
-- through API routes using the service-role client, which enforces ownership
-- by filtering on the authenticated user's id.

-- ========== extensions ==========
create extension if not exists pgcrypto;

-- ========== PROFILES (org-less) ==========
-- if the table already exists, just ensure the columns we need are present
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists username   text,
  add column if not exists full_name  text,
  add column if not exists avatar_url text,
  add column if not exists bio        text,
  add column if not exists created_at timestamptz;

-- if created_at existed without default, add one (safe no-op if already set)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='created_at' and column_default is null
  ) then
    alter table public.profiles alter column created_at set default now();
  end if;
end $$;

-- ========== ROLES (global) ==========
create table if not exists public.roles (
  id text primary key,
  rank int,
  description text
);

-- ensure columns exist (if roles table predates "rank")
alter table public.roles
  add column if not exists rank int,
  add column if not exists description text;

-- upsert canonical roles (also refresh rank/description if changed)
insert into public.roles (id, rank, description) values
  ('admin',      100, 'site administrator'),
  ('moderator',   80, 'content moderation'),
  ('member',      50, 'regular user'),
  ('suspended',   20, 'signed-in but limited'),
  ('guest',       30, 'signed-in but limited'),
  ('banned',       0, 'no access')
on conflict (id) do update
  set rank = excluded.rank,
      description = excluded.description
  where (public.roles.rank is distinct from excluded.rank)
     or (public.roles.description is distinct from excluded.description);

-- ========== USER GLOBAL ROLES ==========
create table if not exists public.user_global_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_id text references public.roles(id),
  assigned_at timestamptz not null default now()
);

-- ensure columns exist even if table pre-existed
alter table public.user_global_roles
  add column if not exists role_id text,
  add column if not exists assigned_at timestamptz;

-- helpful index (safe if already there)
create index if not exists idx_user_global_roles_role on public.user_global_roles(role_id);

-- ========== RLS: enable (no policies => private) ==========
alter table if exists public.profiles           enable row level security;
alter table if exists public.roles              enable row level security;
alter table if exists public.user_global_roles  enable row level security;

-- ========== REVOKE anon/auth privileges (keep it private) ==========
-- target just these tables to avoid surprises
do $$
begin
  if to_regclass('public.profiles') is not null then
    revoke all on table public.profiles from anon, authenticated;
  end if;
  if to_regclass('public.roles') is not null then
    revoke all on table public.roles from anon, authenticated;
  end if;
  if to_regclass('public.user_global_roles') is not null then
    revoke all on table public.user_global_roles from anon, authenticated;
  end if;
end $$;

-- ========== TRIGGER: auto profile + default "member" on signup ==========
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- create profile if missing
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- ensure a global role row exists; default to 'member'
  insert into public.user_global_roles (user_id, role_id)
  values (new.id, 'member')
  on conflict (user_id) do nothing;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ========== STORAGE: public bucket for avatars ==========
-- The avatar upload route (src/app/api/profile/avatar/route.ts) uploads via
-- the service-role client and serves files through public URLs.
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;
