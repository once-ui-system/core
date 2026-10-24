-- Acme Notes: profile sync, organization creation and invitation acceptance.

-- Keep public.profiles in step with auth.users (email is what the members list shows).
create function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end
$$;

create trigger on_auth_user_saved
  after insert or update of email on auth.users
  for each row execute function public.handle_auth_user();

insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Creates an organization with the caller as its owner. Returns { id, slug, name }.
create function public.create_organization(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  clean_name text := btrim(p_name);
  base_slug text;
  org public.organizations;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if char_length(clean_name) < 1 or char_length(clean_name) > 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  base_slug := coalesce(
    nullif(btrim(regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'), '-'), ''),
    'org'
  );

  insert into public.organizations (slug, name)
  values (
    base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8),
    clean_name
  )
  returning * into org;

  insert into public.memberships (org_id, user_id, role)
  values (org.id, uid, 'owner');

  return jsonb_build_object('id', org.id, 'slug', org.slug, 'name', org.name);
end
$$;

-- Joins the caller to the invitation's organization with the invitation's role.
-- Returns { id, slug, name, role }. Raises invitation_not_found, invitation_expired
-- or email_mismatch. An existing member keeps their current role.
create function public.accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  inv public.invitations;
  org public.organizations;
  caller_email text;
  existing_role text;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into inv from public.invitations where token = p_token;
  if not found then
    raise exception 'invitation_not_found' using errcode = 'P0002';
  end if;
  if inv.expires_at <= now() then
    raise exception 'invitation_expired' using errcode = 'P0001';
  end if;

  select email into caller_email from public.profiles where id = uid;
  if inv.email is not null and lower(inv.email) <> lower(coalesce(caller_email, '')) then
    raise exception 'email_mismatch' using errcode = '42501';
  end if;

  select * into org from public.organizations where id = inv.org_id;

  select m.role into existing_role
  from public.memberships m
  where m.org_id = inv.org_id and m.user_id = uid;

  if existing_role is null then
    insert into public.memberships (org_id, user_id, role)
    values (inv.org_id, uid, inv.role);
    existing_role := inv.role;
  end if;

  return jsonb_build_object('id', org.id, 'slug', org.slug, 'name', org.name, 'role', existing_role);
end
$$;

revoke execute on function public.org_role(uuid) from public, anon;
grant execute on function public.org_role(uuid) to authenticated;

revoke execute on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;

revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;
