-- Organizations, memberships and invitations.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  plan text not null default 'free' check (plan in ('free', 'team')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index org_members_user_idx on public.org_members (user_id);

create table public.invitations (
  token text primary key,
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index invitations_org_idx on public.invitations (org_id);

-- Row level security is on everywhere. There are no policies on purpose:
-- the server reaches the tables with the service role after checking
-- membership and role itself (src/lib/orgs/server.ts).
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.invitations enable row level security;
