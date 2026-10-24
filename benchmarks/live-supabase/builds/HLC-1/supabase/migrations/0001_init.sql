-- Acme Notes schema. Applies in filename order to a fresh Supabase project (psql as postgres).
-- Row level security is enabled on every table in the public schema (see the end of this file).

-- Profiles mirror auth.users so members can be listed with their email.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,60}$'),
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
  token text not null unique check (char_length(token) >= 32),
  email text check (email is null or char_length(email) <= 320),
  role text not null check (role in ('admin', 'member')),
  created_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index invitations_org_id_idx on public.invitations (org_id);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

-- The caller's role in an organization, or null when they are not a member.
-- Security definer so policies can use it without recursing into memberships' own policy.
create or replace function public.org_role(p_org uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role from public.memberships m
  where m.org_id = p_org and m.user_id = auth.uid()
$$;

-- Keep profiles in step with auth.users (email is read by the members list).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end
$$;

create trigger on_auth_user_saved
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Creates an organization and makes the caller its owner, in one step.
create or replace function public.create_organization(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_base text;
  v_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  v_base := left(btrim(regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'), '-'), 40);
  if v_base = '' then
    v_base := 'org';
  end if;
  insert into public.organizations (slug, name)
  values (v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 6), v_name)
  returning * into v_org;
  insert into public.memberships (org_id, user_id, role) values (v_org.id, auth.uid(), 'owner');
  return jsonb_build_object('id', v_org.id, 'slug', v_org.slug, 'name', v_org.name, 'plan', v_org.plan, 'role', 'owner');
end
$$;

-- Joins the caller to the invitation's organization with the invitation's role.
-- Invitations that name an email only work for that email. Existing members keep their role.
create or replace function public.accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invitations;
  v_org public.organizations;
  v_email text;
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  select * into v_inv from public.invitations where token = p_token;
  if not found then
    raise exception 'invalid_invitation' using errcode = 'P0002';
  end if;
  if v_inv.expires_at <= now() then
    raise exception 'invitation_expired' using errcode = 'P0001';
  end if;
  if v_inv.email is not null then
    select lower(u.email) into v_email from auth.users u where u.id = auth.uid();
    if v_email is distinct from lower(v_inv.email) then
      raise exception 'invitation_email_mismatch' using errcode = '42501';
    end if;
  end if;
  select * into v_org from public.organizations where id = v_inv.org_id;
  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, auth.uid(), v_inv.role)
  on conflict (org_id, user_id) do nothing;
  update public.invitations
  set accepted_at = coalesce(accepted_at, now()), accepted_by = coalesce(accepted_by, auth.uid())
  where id = v_inv.id;
  select m.role into v_role from public.memberships m where m.org_id = v_org.id and m.user_id = auth.uid();
  return jsonb_build_object('id', v_org.id, 'slug', v_org.slug, 'name', v_org.name, 'plan', v_org.plan, 'role', v_role);
end
$$;

-- Policies. Writes to memberships and organizations are done by the functions above
-- or by the service role (Stripe webhook); authenticated users get no direct write on them.
create policy profiles_select on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.memberships m
    where m.user_id = profiles.id and public.org_role(m.org_id) is not null
  )
);

create policy organizations_select on public.organizations for select to authenticated
using (public.org_role(id) is not null);

create policy organizations_update on public.organizations for update to authenticated
using (public.org_role(id) in ('owner', 'admin'))
with check (public.org_role(id) in ('owner', 'admin'));

create policy memberships_select on public.memberships for select to authenticated
using (user_id = auth.uid() or public.org_role(org_id) is not null);

create policy invitations_select on public.invitations for select to authenticated
using (public.org_role(org_id) in ('owner', 'admin'));

create policy invitations_insert on public.invitations for insert to authenticated
with check (
  created_by = auth.uid()
  and role in ('admin', 'member')
  and public.org_role(org_id) in ('owner', 'admin')
);

-- Column-level and table-level grants for the signed-in role.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.organizations, public.memberships, public.invitations to authenticated;
grant update (name) on public.organizations to authenticated;
grant insert (org_id, role, email, token, expires_at, created_by) on public.invitations to authenticated;

revoke execute on function public.org_role(uuid) from public, anon;
grant execute on function public.org_role(uuid) to authenticated;
revoke execute on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;
revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Row level security on every table in the public schema, including any added later in this file.
do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end
$$;
