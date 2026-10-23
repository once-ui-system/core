-- Acme Notes: organizations, memberships and invitations (multi-tenancy).
--
-- RLS is ON with no policies. Nothing in the database scopes a row to a
-- tenant; every org-scoped query in the app goes through the guards in
-- src/lib/orgs/server.ts, which check membership and role on the server.

create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  personal   boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint organizations_slug_shape check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$')
);

-- One personal organization per user.
create unique index organizations_one_personal_per_user
  on public.organizations (created_by) where personal;

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member',
  email           text,
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id),
  constraint organization_members_role_valid check (role in ('owner', 'admin', 'member'))
);

create index organization_members_user_idx on public.organization_members (user_id);

-- Only the SHA-256 of an invitation token is stored. The email is optional:
-- a link without one can be accepted by whoever holds it.
create table public.organization_invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email           text,
  role            text not null default 'member',
  token_hash      text not null unique,
  invited_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  accepted_at     timestamptz,
  accepted_by     uuid references auth.users(id) on delete set null,
  revoked_at      timestamptz,
  constraint organization_invitations_role_valid check (role in ('admin', 'member'))
);

create index organization_invitations_org_idx on public.organization_invitations (organization_id);

alter table public.organizations            enable row level security;
alter table public.organization_members     enable row level security;
alter table public.organization_invitations enable row level security;

revoke all on table public.organizations            from anon, authenticated;
revoke all on table public.organization_members     from anon, authenticated;
revoke all on table public.organization_invitations from anon, authenticated;

grant all on table public.organizations            to service_role;
grant all on table public.organization_members     to service_role;
grant all on table public.organization_invitations to service_role;
