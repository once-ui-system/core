-- Acme Notes schema. Applies to a fresh Supabase project, in filename order.
-- Row level security is on for every table in the public schema.

-- Profiles mirror auth.users so member lists can show an email.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
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

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  email text,
  role text not null check (role in ('admin', 'member')),
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

revoke all on public.profiles, public.organizations, public.memberships, public.invitations from anon;

-- Keep profiles.email in step with auth.users.
create function public.sync_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.sync_profile();

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile();

-- Membership helpers. Security definer so policies can ask them without
-- recursing into the memberships policies.
create function public.is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid()
  )
$$;

create function public.can_manage_org(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  )
$$;

create function public.shares_org_with(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.org_id = mine.org_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user
  )
$$;

-- Policies. Writes to organizations go through the policies below; creating
-- an organization, joining one and changing memberships go through functions.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_org_with(id));

create policy organizations_select on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update on public.organizations for update to authenticated
  using (public.can_manage_org(id))
  with check (public.can_manage_org(id));

-- Only the webhook (service role) changes a plan, so admins may rename but not re-plan.
revoke update on public.organizations from authenticated;
grant update (name) on public.organizations to authenticated;

create policy memberships_select on public.memberships for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(org_id));

create policy invitations_select on public.invitations for select to authenticated
  using (public.can_manage_org(org_id));

create policy invitations_insert on public.invitations for insert to authenticated
  with check (created_by = auth.uid() and public.can_manage_org(org_id) and role in ('admin', 'member'));

create policy invitations_delete on public.invitations for delete to authenticated
  using (public.can_manage_org(org_id));

-- Functions the app calls.
create function public.my_organizations()
returns table (id uuid, slug text, name text, plan text, role text)
language sql stable security definer set search_path = '' as $$
  select o.id, o.slug, o.name, o.plan, m.role
  from public.memberships m
  join public.organizations o on o.id = m.org_id
  where m.user_id = auth.uid()
  order by o.created_at, o.name
$$;

create function public.list_members(p_org uuid)
returns table (user_id uuid, email text, role text)
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.email, m.role
  from public.memberships m
  join public.profiles p on p.id = m.user_id
  where m.org_id = p_org and public.is_org_member(p_org)
  order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, p.email
$$;

create function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql security definer set search_path = '' as $$
declare
  v_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  insert into public.organizations (slug, name) values (p_slug, p_name) returning * into v_org;
  insert into public.memberships (org_id, user_id, role) values (v_org.id, auth.uid(), 'owner');
  return v_org;
end $$;

-- Returns the caller's membership, or null when the token is unknown or expired.
create function public.accept_invitation(p_token text)
returns public.memberships
language plpgsql security definer set search_path = '' as $$
declare
  v_inv public.invitations;
  v_membership public.memberships;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  select * into v_inv from public.invitations where token = p_token and expires_at > now();
  if not found then
    return null;
  end if;
  insert into public.memberships (org_id, user_id, role) values (v_inv.org_id, auth.uid(), v_inv.role)
  on conflict (org_id, user_id) do nothing;
  select * into v_membership from public.memberships
  where org_id = v_inv.org_id and user_id = auth.uid();
  return v_membership;
end $$;

revoke execute on function public.is_org_member(uuid), public.can_manage_org(uuid), public.shares_org_with(uuid),
  public.sync_profile() from public, anon;
revoke execute on function public.my_organizations(), public.list_members(uuid),
  public.create_organization(text, text), public.accept_invitation(text) from public, anon;
grant execute on function public.my_organizations(), public.list_members(uuid),
  public.create_organization(text, text), public.accept_invitation(text) to authenticated;

-- Policies call these helpers as the signed-in user.
grant execute on function public.is_org_member(uuid), public.can_manage_org(uuid), public.shares_org_with(uuid) to authenticated;
