-- Acme Notes: organizations, memberships and invitations.
-- Applied in filename order to a fresh Supabase project, stopping at the first error.

-- An organization. The plan starts on free; the Stripe webhook sets team.
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name        text not null check (char_length(name) between 1 and 80),
  plan        text not null default 'free' check (plan in ('free', 'team')),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Who belongs to an organization, and with which role. email is a display copy
-- taken when the member joined.
create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  email           text,
  role            text not null check (role in ('owner', 'admin', 'member')),
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);

-- An invitation link. Only the SHA-256 of the token is stored. Links last seven days.
create table public.organization_invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email           text,
  role            text not null check (role in ('admin', 'member')),
  token_hash      text not null unique,
  invited_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days')
);

create index organization_invitations_org_idx on public.organization_invitations (organization_id);
