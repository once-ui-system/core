-- Stripe identifiers on each organization. The plan itself is set by the webhook.
alter table public.organizations
  add column stripe_customer_id text,
  add column stripe_subscription_id text;
