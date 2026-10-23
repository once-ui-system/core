-- Acme Notes: plans and optional-email invitations.

-- Each organization is on the free plan until a Stripe Checkout completes.
alter table public.organizations
  add column if not exists plan text not null default 'free';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_plan_valid'
  ) then
    alter table public.organizations
      add constraint organizations_plan_valid check (plan in ('free', 'team'));
  end if;
end $$;

-- An invitation may be for a specific address or open to whoever holds the link.
alter table public.organization_invitations
  alter column email drop not null;

alter table public.organizations enable row level security;
alter table public.organization_invitations enable row level security;
