-- Organizations, memberships and invitations.
-- Applied in filename order to a fresh Supabase project (psql as postgres, ON_ERROR_STOP).

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 80),
  plan text not null default 'free' check (plan in ('free', 'team')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  email text,
  role text not null check (role in ('admin', 'member')),
  created_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships (user_id);
create index invitations_org_id_idx on public.invitations (org_id);
