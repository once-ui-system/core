-- Membership helper and read policies. Security definer so the policies do not
-- recurse into memberships' own row level security.

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;

create policy "members read their organizations"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "members read memberships of their organizations"
  on public.memberships for select
  to authenticated
  using (user_id = auth.uid() or public.is_org_member(org_id));

-- Members list with emails (emails live in auth.users). Service role only; the
-- server checks membership before calling it.
create or replace function public.org_members(p_org uuid)
returns table (user_id uuid, email text, role text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select m.user_id, u.email::text, m.role
  from public.memberships m
  join auth.users u on u.id = m.user_id
  where m.org_id = p_org
  order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, u.email;
$$;

revoke all on function public.org_members(uuid) from public, anon, authenticated;
grant execute on function public.org_members(uuid) to service_role;
