-- Acme Notes: plans. Run after 0001_orgs.sql.
-- Every organization starts on 'free'. Only the Stripe webhook moves it to
-- 'team', when a Checkout session for that organization completes.

alter table public.organizations
  add column if not exists plan text not null default 'free'
  constraint organizations_plan_valid check (plan in ('free', 'team'));
