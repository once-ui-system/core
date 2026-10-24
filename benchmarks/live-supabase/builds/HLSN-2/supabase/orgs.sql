-- Multi-tenancy for the Once UI Stack (the `orgs` slice).
-- Run after init.sql. Idempotent: safe to re-run.
--
-- ONE PROJECT PER APP, same as init.sql. These tables are unprefixed, so an
-- app joining a Supabase project that other products already share must
-- prefix them (<app>_organizations, <app>_organization_members) and adjust
-- src/lib/orgs/ to match. See docs/composition/README.md, "Shared Supabase
-- projects".
--
-- NO TRIGGER ON auth.users. A user's personal organization is created lazily,
-- on the first authenticated request that needs one (requireOrg in
-- src/lib/orgs/server.ts). On a shared project a trigger would fire for every
-- other product's sign-ups too.
--
-- ACCESS MODEL — read this before adding a query. RLS is enabled with NO
-- policies, so Postgres denies anon/authenticated clients outright and the
-- service-role client bypasses it entirely. Nothing in the database scopes a
-- row to a tenant: the boundary is application code and only application code.
-- Every org-scoped read or write must go through requireOrg(), which resolves
-- the slug, asserts membership, and hands back the organization id to filter
-- on. A query that filters on anything else is a cross-tenant leak.

create extension if not exists pgcrypto;

-- ========== ORGANIZATIONS ==========
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  personal   boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.organizations
  add column if not exists slug       text,
  add column if not exists name       text,
  add column if not exists personal   boolean,
  add column if not exists created_by uuid,
  add column if not exists created_at timestamptz;

-- A slug is a URL segment: lowercase, digits and dashes, no leading dash.
-- Enforced here as well as in the API so a direct insert cannot produce a
-- tenant that its own routes cannot address.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_slug_shape'
  ) then
    alter table public.organizations
      add constraint organizations_slug_shape
      check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$');
  end if;
end $$;

-- One personal organization per user. A partial unique index rather than a
-- column constraint, because non-personal organizations are unlimited.
create unique index if not exists organizations_one_personal_per_user
  on public.organizations (created_by) where personal;

-- ========== MEMBERSHIP ==========
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member',
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organization_members_role_valid'
  ) then
    alter table public.organization_members
      add constraint organization_members_role_valid
      check (role in ('owner', 'admin', 'member'));
  end if;
end $$;

-- The switcher lists every organization for one user on every dashboard
-- request, so that lookup is the hot path.
create index if not exists organization_members_user_idx
  on public.organization_members (user_id);

-- ========== RLS: ON, WITH NO POLICIES ==========
-- Deliberate. See the access model note at the top of this file.
alter table if exists public.organizations        enable row level security;
alter table if exists public.organization_members enable row level security;

-- ========== MEMBER EMAIL ==========
-- The address a member joined with, copied from auth.users at join time so
-- the members table can show and search it without one auth admin call per
-- row. Nullable: rows that predate the column fall back to the profile. It is
-- a display copy, never an identity — guards key on user_id only.
alter table public.organization_members
  add column if not exists email text;

-- ========== INVITATIONS ==========
-- A pending invitation is a row here plus a link holding a random token.
-- Only the token's SHA-256 is stored, so a leaked table (a backup, a log of
-- selects) cannot be replayed as invitations. Accepting requires a signed-in
-- user whose verified email matches `email`: a forwarded link is useless to
-- anyone the invitation was not for.
create table if not exists public.organization_invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email           text not null,
  role            text not null default 'member',
  token_hash      text not null unique,
  invited_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  accepted_at     timestamptz,
  accepted_by     uuid references auth.users(id) on delete set null,
  revoked_at      timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organization_invitations_role_valid'
  ) then
    -- Owner is not invitable: ownership is handed over to someone already
    -- inside, with an owner watching, never mailed out as a link.
    alter table public.organization_invitations
      add constraint organization_invitations_role_valid
      check (role in ('admin', 'member'));
  end if;
end $$;

-- One open invitation per address per organization; re-inviting replaces it.
create unique index if not exists organization_invitations_one_open
  on public.organization_invitations (organization_id, lower(email))
  where accepted_at is null and revoked_at is null;

alter table if exists public.organization_invitations enable row level security;
