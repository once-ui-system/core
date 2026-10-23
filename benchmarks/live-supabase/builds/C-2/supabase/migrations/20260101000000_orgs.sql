-- Organizations, memberships and invitations.
-- Access goes through server routes using the service role, which bypasses RLS.
-- RLS is enabled on every table with no policies, so anon/authenticated roles get nothing.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  plan text not null default 'free' check (plan in ('free', 'team')),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null,
  email text not null default '',
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index memberships_user_idx on public.memberships (user_id);

create table public.invitations (
  token text primary key,
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz not null default now()
);

create index invitations_org_idx on public.invitations (org_id);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
