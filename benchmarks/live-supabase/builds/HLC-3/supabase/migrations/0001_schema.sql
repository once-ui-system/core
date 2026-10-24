-- Acme Notes: tables, role helpers and row level security.
-- Applies to a fresh Supabase project, after the built-in auth schema exists.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 80),
  plan text not null default 'free' check (plan in ('free', 'team')),
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  email text,
  role text not null check (role in ('admin', 'member')),
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- The signed-in user's role in an organization, or null when not a member.
-- Security definer so policies on memberships can use it without recursing.
create function public.org_role(p_org uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.memberships m
  where m.org_id = p_org and m.user_id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

-- profiles: you see your own row and the rows of people you share an organization with.
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships mine
      join public.memberships theirs on theirs.org_id = mine.org_id
      where mine.user_id = auth.uid() and theirs.user_id = public.profiles.id
    )
  );

-- organizations: members read them; owners and admins rename them.
-- Organizations are created through create_organization() and plans change only
-- through the Stripe webhook (service role), so there are no insert or delete policies.
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.org_role(id) is not null);

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.org_role(id) in ('owner', 'admin'))
  with check (public.org_role(id) in ('owner', 'admin'));

revoke update on public.organizations from authenticated;
grant update (name) on public.organizations to authenticated;

-- memberships: members see the members of their organizations. Writes go through RPCs.
create policy memberships_select on public.memberships
  for select to authenticated
  using (public.org_role(org_id) is not null);

-- invitations: owners and admins see and create them. Acceptance goes through accept_invitation().
create policy invitations_select on public.invitations
  for select to authenticated
  using (public.org_role(org_id) in ('owner', 'admin'));

create policy invitations_insert on public.invitations
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.org_role(org_id) in ('owner', 'admin')
    and role in ('admin', 'member')
  );
