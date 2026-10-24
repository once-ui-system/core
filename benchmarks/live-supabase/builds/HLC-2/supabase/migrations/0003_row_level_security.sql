-- Row level security: every table in public is enabled (see 0004); these policies
-- say who may see and change what. Writes that must create several rows go through
-- the functions in 0002. The plan is changed only by the service role (Stripe webhook).

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.organizations to authenticated;
grant update (name) on public.organizations to authenticated;
grant select on public.memberships to authenticated;
grant select, insert on public.invitations to authenticated;

create policy "members read their organizations"
  on public.organizations for select to authenticated
  using (public.org_role(id) is not null);

create policy "owners and admins rename their organization"
  on public.organizations for update to authenticated
  using (public.org_role(id) in ('owner', 'admin'))
  with check (public.org_role(id) in ('owner', 'admin'));

create policy "members read memberships of their organizations"
  on public.memberships for select to authenticated
  using (public.org_role(org_id) is not null);

create policy "owners and admins read invitations"
  on public.invitations for select to authenticated
  using (public.org_role(org_id) in ('owner', 'admin'));

create policy "owners and admins create invitations"
  on public.invitations for insert to authenticated
  with check (public.org_role(org_id) in ('owner', 'admin') and created_by = auth.uid());
