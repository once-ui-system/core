-- Acme Notes: each organization has a plan, `free` or `team`, starting on free.
-- The Stripe webhook sets it to `team` when a checkout completes.

alter table public.organizations
  add column plan text not null default 'free',
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add constraint organizations_plan_valid check (plan in ('free', 'team'));
