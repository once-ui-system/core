-- Helpers and the operations that must run as a unit. They are security definer
-- so they can read across RLS for the caller's own rows, and each one checks
-- auth.uid() itself.

-- The caller's role in an organization, or null when not a member.
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

-- Creates an organization and makes the caller its owner.
create or replace function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  insert into public.organizations (slug, name, created_by)
  values (p_slug, p_name, auth.uid())
  returning * into o;
  insert into public.memberships (org_id, user_id, role)
  values (o.id, auth.uid(), 'owner');
  return o;
end;
$$;

-- Joins the caller to the invitation's organization with the invitation's role.
-- Invitation links stay valid until they expire; joining twice changes nothing.
create or replace function public.accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations;
  o public.organizations;
  r text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select * into inv from public.invitations where token = p_token;
  if not found then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;
  if inv.expires_at <= now() then
    raise exception 'invitation expired' using errcode = '22023';
  end if;
  insert into public.memberships (org_id, user_id, role)
  values (inv.org_id, auth.uid(), inv.role)
  on conflict (org_id, user_id) do nothing;
  select o2.* into o from public.organizations o2 where o2.id = inv.org_id;
  select m.role into r from public.memberships m
  where m.org_id = inv.org_id and m.user_id = auth.uid();
  return jsonb_build_object('id', o.id, 'slug', o.slug, 'name', o.name, 'role', r);
end;
$$;

-- Members of an organization with their emails. Any member may list them.
create or replace function public.org_members(p_org uuid)
returns table (user_id uuid, email text, role text)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if public.org_role(p_org) is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select m.user_id, u.email::text, m.role::text
    from public.memberships m
    join auth.users u on u.id = m.user_id
    where m.org_id = p_org
    order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, u.email;
end;
$$;

revoke all on function public.org_role(uuid) from public, anon;
revoke all on function public.create_organization(text, text) from public, anon;
revoke all on function public.accept_invitation(text) from public, anon;
revoke all on function public.org_members(uuid) from public, anon;
grant execute on function public.org_role(uuid) to authenticated;
grant execute on function public.create_organization(text, text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.org_members(uuid) to authenticated;
