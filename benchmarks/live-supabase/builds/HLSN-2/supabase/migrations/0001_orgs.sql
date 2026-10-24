-- Acme Notes: organizations, memberships and invitations.
-- Files in supabase/migrations/ apply in filename order to a fresh project:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_orgs.sql
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0002_billing.sql
--
-- Access model: row level security is ON for every table with NO policies.
-- Anon and authenticated clients are refused outright; the app reaches these
-- tables only through the service-role key, and every query is scoped to an
-- organization by the guards in src/lib/orgs/server.ts.

create extension if not exists pgcrypto;

-- ========== ORGANIZATIONS ==========
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique
             constraint organizations_slug_shape check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name       text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== MEMBERSHIP ==========
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member'
                  constraint organization_members_role_valid check (role in ('owner', 'admin', 'member')),
  -- The address the member joined with: a display copy, never an identity.
  email           text,
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id);

-- ========== INVITATIONS ==========
-- Only the SHA-256 of the link's token is stored. An invitation may name an
-- email address or be open to anyone holding the link.
create table if not exists public.organization_invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email           text,
  role            text not null default 'member'
                  constraint organization_invitations_role_valid check (role in ('admin', 'member')),
  token_hash      text not null unique,
  invited_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  accepted_at     timestamptz,
  accepted_by     uuid references auth.users(id) on delete set null,
  revoked_at      timestamptz
);

-- One open invitation per named address per organization; re-inviting replaces it.
create unique index if not exists organization_invitations_one_open_email
  on public.organization_invitations (organization_id, lower(email))
  where email is not null and accepted_at is null and revoked_at is null;

-- ========== RLS: ON, WITH NO POLICIES ==========
alter table public.organizations            enable row level security;
alter table public.organization_members     enable row level security;
alter table public.organization_invitations enable row level security;
