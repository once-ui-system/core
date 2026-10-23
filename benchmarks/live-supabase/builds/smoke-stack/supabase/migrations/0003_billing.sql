-- Organization billing for the Once UI Stack (the `billing` slice).
-- Run after init.sql and orgs.sql. Idempotent: safe to re-run.
--
-- The customer is the organization. Stripe is the source of truth; these
-- tables are a mirror the webhook (src/app/api/webhooks/stripe) keeps current
-- so an entitlement check is one indexed read, not a Stripe call.
--
-- ONE PROJECT PER APP, same as init.sql and orgs.sql: unprefixed tables.
--
-- ACCESS MODEL: RLS on, no policies, service-role client only — exactly like
-- orgs.sql. Reads go through src/lib/billing/server.ts, which takes a guard
-- result, never a bare organization id.

-- ========== CUSTOMERS ==========
-- One Stripe customer per organization, created on the first checkout.
-- Cascade: the customer record in Stripe outlives the organization harmlessly;
-- what must not outlive it unnoticed is a live subscription (below).
create table if not exists public.billing_customers (
  organization_id    uuid primary key references public.organizations(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at         timestamptz not null default now()
);

-- ========== SUBSCRIPTIONS ==========
-- Live subscriptions only. The webhook deletes a row once its subscription is
-- over (canceled, incomplete_expired); history stays in Stripe.
--
-- `on delete restrict` is deliberate: an organization with a live subscription
-- cannot be deleted, so deleting a tenant can never leave a card being charged
-- for it. deleteOrganization() in src/lib/orgs/server.ts turns the refusal
-- into "cancel the subscription first".
create table if not exists public.billing_subscriptions (
  id                   text primary key,
  organization_id      uuid not null references public.organizations(id) on delete restrict,
  status               text not null,
  plan_key             text,
  price_key            text,
  quantity             integer not null default 1,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- Added after the first release of this file; a no-op on a fresh database.
alter table public.billing_subscriptions add column if not exists current_period_start timestamptz;

create index if not exists billing_subscriptions_org_idx
  on public.billing_subscriptions (organization_id);

-- ========== RLS: ON, WITH NO POLICIES ==========
alter table if exists public.billing_customers     enable row level security;
alter table if exists public.billing_subscriptions enable row level security;
