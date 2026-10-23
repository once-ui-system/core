-- Acme Notes: profiles and global roles.
-- Applied first, in filename order, to a fresh Supabase project.
--
-- Access model: row level security is ON for every table in `public` and no
-- policies exist, so anon and authenticated clients are denied outright. The
-- app reads and writes through the service-role client, which bypasses RLS,
-- after checking the signed-in user's membership on the server.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table public.roles (
  id text primary key,
  rank int,
  description text
);

insert into public.roles (id, rank, description) values
  ('admin',      100, 'site administrator'),
  ('moderator',   80, 'content moderation'),
  ('member',      50, 'regular user'),
  ('suspended',   20, 'signed-in but limited'),
  ('guest',       30, 'signed-in but limited'),
  ('banned',       0, 'no access');

create table public.user_global_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_id text references public.roles(id),
  assigned_at timestamptz not null default now()
);

create index idx_user_global_roles_role on public.user_global_roles(role_id);

alter table public.profiles          enable row level security;
alter table public.roles             enable row level security;
alter table public.user_global_roles enable row level security;

revoke all on table public.profiles          from anon, authenticated;
revoke all on table public.roles             from anon, authenticated;
revoke all on table public.user_global_roles from anon, authenticated;

grant all on table public.profiles          to service_role;
grant all on table public.roles             to service_role;
grant all on table public.user_global_roles to service_role;

-- A profile and a default "member" global role for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_global_roles (user_id, role_id)
  values (new.id, 'member')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Public bucket for avatars (src/app/api/profile/avatar/route.ts).
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('profiles', 'profiles', true)
    on conflict (id) do nothing;
  end if;
end $$;
