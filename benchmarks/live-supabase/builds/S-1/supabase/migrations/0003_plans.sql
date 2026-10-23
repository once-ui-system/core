-- Acme Notes: each organization has a plan, `free` or `team`, and starts on free.
-- The Stripe webhook (src/app/api/webhooks/stripe) sets it to `team` when a
-- Checkout session for the organization completes.
alter table public.organizations
  add column if not exists plan text not null default 'free';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_plan_valid'
  ) then
    alter table public.organizations
      add constraint organizations_plan_valid
      check (plan in ('free', 'team'));
  end if;
end $$;
