-- Row level security for every table in public, and the column-level grants.
-- Organizations are created and invitations accepted only through the functions
-- in 0003_functions.sql; the plan is changed only by the Stripe webhook (service role).

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

revoke all on public.profiles, public.organizations, public.memberships, public.invitations
  from anon, authenticated;

grant select on public.profiles, public.organizations, public.memberships to authenticated;
grant update (name) on public.organizations to authenticated;
grant select, insert on public.invitations to authenticated;

-- profiles: your own, and the people who share an organization with you
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships theirs
      join public.memberships mine on mine.org_id = theirs.org_id
      where theirs.user_id = profiles.id
        and mine.user_id = auth.uid()
    )
  );

-- organizations: members see their organizations; owners and admins rename them
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.is_org_member(id, array['owner', 'admin']))
  with check (public.is_org_member(id, array['owner', 'admin']));

-- memberships: your own rows, and the member list of your organizations
create policy memberships_select on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(org_id));

-- invitations: owners and admins create them and see them; nobody else can read a token
create policy invitations_select on public.invitations
  for select to authenticated
  using (public.is_org_member(org_id, array['owner', 'admin']));

create policy invitations_insert on public.invitations
  for insert to authenticated
  with check (
    invited_by = auth.uid()
    and public.is_org_member(org_id, array['owner', 'admin'])
  );
