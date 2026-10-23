create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'team')),
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null default '',
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index org_members_user_idx on public.org_members (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  email text,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index invitations_org_idx on public.invitations (org_id);

-- RLS on with no policies: only the server (service role) reads or writes.
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.invitations enable row level security;

revoke all on public.organizations, public.org_members, public.invitations from anon, authenticated;
