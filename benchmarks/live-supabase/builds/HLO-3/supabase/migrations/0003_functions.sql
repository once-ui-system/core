-- Functions the app calls through RPC. They run as the owner of the function,
-- so they can write memberships, which clients cannot write directly.

create or replace function public.create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_base text;
  v_slug text;
  v_org public.organizations;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  p_name := btrim(p_name);
  if char_length(p_name) < 1 or char_length(p_name) > 80 then
    raise exception 'name must be 1 to 80 characters' using errcode = '22023';
  end if;

  v_base := regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g');
  v_base := btrim(v_base, '-');
  if v_base = '' then
    v_base := 'org';
  end if;
  v_base := left(v_base, 40);

  loop
    v_slug := v_base || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
    exit when not exists (select 1 from public.organizations where slug = v_slug);
  end loop;

  insert into public.organizations (slug, name)
  values (v_slug, p_name)
  returning * into v_org;

  insert into public.memberships (org_id, user_id, role)
  values (v_org.id, v_uid, 'owner');

  return v_org;
end;
$$;

-- Returns {"status": "ok" | "not_found" | "expired", ...org fields and role when ok}.
-- Invitations are reusable until they expire. Joining twice keeps the existing role.
create or replace function public.accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.invitations;
  v_org public.organizations;
  v_role text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select * into v_inv from public.invitations where token = p_token;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_inv.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_org from public.organizations where id = v_inv.org_id;

  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, v_uid, v_inv.role)
  on conflict (org_id, user_id) do nothing;

  select m.role into v_role
  from public.memberships m
  where m.org_id = v_inv.org_id and m.user_id = v_uid;

  return jsonb_build_object(
    'status', 'ok',
    'id', v_org.id,
    'slug', v_org.slug,
    'name', v_org.name,
    'role', v_role
  );
end;
$$;

revoke execute on function public.create_organization(text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;

revoke execute on function public.is_org_member(uuid, text[]) from public, anon;
grant execute on function public.is_org_member(uuid, text[]) to authenticated;
