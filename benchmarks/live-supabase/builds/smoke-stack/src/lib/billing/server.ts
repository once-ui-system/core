/**
 * Organization billing (server-only — never import this from a client component).
 *
 * The customer is the ORGANIZATION, not the person: a plan belongs to the
 * tenant, survives the admin who bought it leaving, and every member gets
 * what it unlocks. So everything here takes a guard result (`AdmittedOrg`),
 * the same rule as src/lib/orgs/server.ts. The only exceptions are the
 * `...ForOrganization` functions for server jobs with no user, which take an
 * id the server produced and are never reached from a request.
 *
 * Stripe is the source of truth. `billing_subscriptions` is a mirror the
 * webhook keeps current, so entitlement checks are one indexed read instead
 * of a Stripe call per request. The webhook never trusts the order events
 * arrive in: every event re-fetches the subscription and writes what Stripe
 * says now.
 *
 * See docs/composition/billing.md.
 */
import {
  type AdmittedOrg,
  type OrgGuardFailure,
  requireOrgRole,
  resolveUserAndService,
} from "@/lib/orgs/server";
import type { OrgRole } from "@/lib/orgs/types";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import type { ServiceClient } from "@/lib/sb/service";
import { createClient } from "@supabase/supabase-js";
import {
  type CatalogPlan,
  catalog,
  findPrice,
  isMetered,
  meteredPrices,
  planForPriceKey,
  planRank,
  priceEnvName,
} from "./catalog";
import { type MirroredSubscription, isEntitling, isTerminal, pickCurrent } from "./status";
import { type BillingMode, type StripeSubscription, billingMode, stripe } from "./stripe";

const SUBSCRIPTION_COLUMNS =
  "id, status, plan_key, price_key, current_period_start, current_period_end, cancel_at_period_end";

/** An organization's billing, as the billing page and the gates read it. */
export interface OrgBilling {
  mode: BillingMode;
  /** The plan in force: the subscription's when it entitles, Free otherwise. */
  plan: { key: string; name: string; features: string[] };
  /** The subscription deciding the plan, entitling or not. Null on Free. */
  subscription: (MirroredSubscription & { entitled: boolean }) | null;
  /** Whether the caller may change the plan (owners and admins). */
  canManage: boolean;
  /** Whether a Stripe customer exists — the portal needs one. */
  hasCustomer: boolean;
  /** The Stripe customer id, for server code only; the billing route leaves it out. */
  customerId: string | null;
}

export type BillingFailure = OrgGuardFailure;

async function readSubscriptions(service: ServiceClient, organizationId: string) {
  const { data, error } = await service
    .from("billing_subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("organization_id", organizationId);
  return { rows: (data ?? []) as unknown as MirroredSubscription[], error };
}

/** The plan and subscription of an organization a guard admitted the caller to. */
export async function getOrgBilling(
  admitted: AdmittedOrg,
): Promise<{ ok: true; billing: OrgBilling } | BillingFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;
  return loadBilling(
    auth.service,
    admitted.org.id,
    admitted.role === "owner" || admitted.role === "admin",
  );
}

/**
 * The same read for trusted server jobs with no signed-in user (a usage cron,
 * a queue worker). Takes a bare organization id, so it must never be reached
 * with an id from a request: route handlers use `getOrgBilling` behind a guard.
 */
export async function getBillingForOrganization(
  organizationId: string,
): Promise<{ ok: true; billing: OrgBilling } | BillingFailure> {
  const service = systemServiceClient();
  if (!service) return { ok: false, status: 503, error: "Supabase is not configured" };
  return loadBilling(service, organizationId, false);
}

async function loadBilling(
  service: ServiceClient,
  organizationId: string,
  canManage: boolean,
): Promise<{ ok: true; billing: OrgBilling } | BillingFailure> {
  const { rows, error } = await readSubscriptions(service, organizationId);
  if (error) return { ok: false, status: 500, error: "Failed to load billing" };

  const { data: customer } = await service
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const current = pickCurrent(rows, planRank);
  const entitled = current ? isEntitling(current.status) : false;
  const paidPlan: CatalogPlan | null = entitled
    ? (planForPriceKey(current?.price_key) ??
      catalog.plans.find((plan) => plan.key === current?.plan_key) ??
      null)
    : null;

  return {
    ok: true,
    billing: {
      mode: billingMode(),
      plan: paidPlan
        ? { key: paidPlan.key, name: paidPlan.name, features: paidPlan.features }
        : { key: catalog.free.key, name: catalog.free.name, features: catalog.free.features },
      subscription: current ? { ...current, entitled } : null,
      canManage,
      hasCustomer: Boolean(customer),
      customerId: (customer as { stripe_customer_id: string } | null)?.stripe_customer_id ?? null,
    },
  };
}

/**
 * A member of `slug` whose organization's plan includes `feature` — the gate
 * for anything paid. Answers 402 when the plan lacks it, after the org guard
 * has answered everything else, so a non-member still sees a 404 and learns
 * nothing about the tenant's plan.
 *
 * ```ts
 * const gate = await requireOrgFeature(slug, "api");
 * if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
 * ```
 */
export async function requireOrgFeature(
  slug: string,
  feature: string,
  minimumRole: OrgRole = "member",
): Promise<(AdmittedOrg & { billing: OrgBilling }) | BillingFailure> {
  const guard = await requireOrgRole(slug, minimumRole);
  if (!guard.ok) return guard;

  const result = await getOrgBilling(guard);
  if (!result.ok) return result;

  if (!result.billing.plan.features.includes(feature)) {
    return {
      ok: false,
      status: 402,
      error: `Your plan doesn't include ${feature}. Upgrade to use it.`,
    };
  }
  return { ...guard, billing: result.billing };
}

// ---------------------------------------------------------------------------
// Checkout and the customer portal
// ---------------------------------------------------------------------------

/** The org's Stripe customer, created on first need with an idempotency key so a double click makes one. */
async function ensureCustomer(
  service: ServiceClient,
  admitted: AdmittedOrg,
  email: string | null,
): Promise<{ ok: true; customerId: string } | BillingFailure> {
  const { data: existing } = await service
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", admitted.org.id)
    .maybeSingle();
  if (existing)
    return {
      ok: true,
      customerId: (existing as { stripe_customer_id: string }).stripe_customer_id,
    };

  const created = await stripe<{ id: string }>(
    "POST",
    "/v1/customers",
    {
      name: admitted.org.name,
      email: email ?? undefined,
      metadata: { organization_id: admitted.org.id, organization_slug: admitted.org.slug },
    },
    { idempotencyKey: `stack-customer-${admitted.org.id}` },
  );
  if (!created.ok) return created;

  // A concurrent first checkout may have inserted the row already; the
  // idempotency key made both calls return the same customer, so either row
  // is the right one.
  const { error } = await service
    .from("billing_customers")
    .upsert(
      { organization_id: admitted.org.id, stripe_customer_id: created.data.id },
      { onConflict: "organization_id", ignoreDuplicates: true },
    );
  if (error) return { ok: false, status: 500, error: "Failed to save the billing customer" };
  return { ok: true, customerId: created.data.id };
}

/** A Stripe price id for a catalog key: the env var stripe-sync prints, else a lookup_key search. */
async function resolvePriceId(
  priceKey: string,
): Promise<{ ok: true; id: string } | BillingFailure> {
  const fromEnv = process.env[priceEnvName(priceKey)];
  if (fromEnv) return { ok: true, id: fromEnv };

  const found = await stripe<{ data: { id: string }[] }>(
    "GET",
    `/v1/prices?lookup_keys[]=${encodeURIComponent(priceKey)}&active=true&limit=1`,
  );
  if (!found.ok) return found;
  const id = found.data.data[0]?.id;
  if (!id) {
    return {
      ok: false,
      status: 500,
      error: `No Stripe price for "${priceKey}". Run npm run stripe:sync.`,
    };
  }
  return { ok: true, id };
}

function billingPath(admitted: AdmittedOrg): string {
  return `/app/${admitted.org.slug}/billing`;
}

/**
 * Start a checkout for `priceKey`. Owners and admins only — the route uses
 * `requireOrgAdmin`, and this refuses anyone else again so the rule does not
 * live in one place only.
 */
export async function startCheckout(
  admitted: AdmittedOrg,
  priceKey: unknown,
  origin: string,
): Promise<{ ok: true; url: string } | BillingFailure> {
  if (admitted.role !== "owner" && admitted.role !== "admin") {
    return { ok: false, status: 403, error: "Admin or owner access required" };
  }
  const entry = typeof priceKey === "string" ? findPrice(priceKey) : null;
  if (!entry || !entry.price.interval) return { ok: false, status: 400, error: "Unknown plan" };

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  // Already on an entitling subscription: changing plan is the portal's job,
  // and a second checkout would bill the organization twice.
  const { rows } = await readSubscriptions(auth.service, admitted.org.id);
  if (rows.some((row) => isEntitling(row.status))) {
    return {
      ok: false,
      status: 409,
      error: "This organization already has a plan. Manage it from billing.",
    };
  }

  const mode = billingMode();
  if (mode === "off") return { ok: false, status: 503, error: "Billing is not configured" };

  if (mode === "mock") {
    const period = { day: 1, week: 7, month: 30, year: 365 }[entry.price.interval];
    const now = Date.now();
    const { error } = await auth.service.from("billing_subscriptions").upsert({
      id: `mock_${admitted.org.id}`,
      organization_id: admitted.org.id,
      status: "active",
      plan_key: entry.plan.key,
      price_key: entry.price.key,
      quantity: 1,
      current_period_start: new Date(now).toISOString(),
      current_period_end: new Date(now + period * 86_400_000).toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, status: 500, error: "Failed to activate the plan" };
    return {
      ok: true,
      url: new URL(`${billingPath(admitted)}?checkout=success`, origin).toString(),
    };
  }

  const customer = await ensureCustomer(auth.service, admitted, auth.email);
  if (!customer.ok) return customer;
  // The chosen price, plus the plan's metered prices on the same interval, so
  // a flat fee and its usage land on one subscription and one invoice.
  // Metered line items take no quantity; Stripe bills what the meter recorded.
  const wanted = isMetered(entry.price)
    ? [entry.price]
    : [entry.price, ...meteredPrices(entry.plan, entry.price.interval)];
  const lineItems: { price: string; quantity?: number }[] = [];
  for (const item of wanted) {
    const price = await resolvePriceId(item.key);
    if (!price.ok) return price;
    lineItems.push(isMetered(item) ? { price: price.id } : { price: price.id, quantity: 1 });
  }

  const session = await stripe<{ url: string | null }>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    customer: customer.customerId,
    client_reference_id: admitted.org.id,
    line_items: lineItems,
    allow_promotion_codes: "true",
    // Carried onto the subscription, so the webhook can place it even if the
    // customer row is missing (a customer created by hand in the dashboard).
    subscription_data: { metadata: { organization_id: admitted.org.id } },
    success_url: new URL(`${billingPath(admitted)}?checkout=success`, origin).toString(),
    cancel_url: new URL(`${billingPath(admitted)}?checkout=cancelled`, origin).toString(),
  });
  if (!session.ok) return session;
  if (!session.data.url)
    return { ok: false, status: 502, error: "The payment provider returned no checkout page" };
  return { ok: true, url: session.data.url };
}

/**
 * The Stripe customer portal: change plan, update the card, cancel. In mock
 * mode there is no portal, so this cancels the mock plan instead — the one
 * thing a demo needs to show the way back to Free.
 */
export async function openPortal(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | BillingFailure> {
  if (admitted.role !== "owner" && admitted.role !== "admin") {
    return { ok: false, status: 403, error: "Admin or owner access required" };
  }
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const mode = billingMode();
  if (mode === "off") return { ok: false, status: 503, error: "Billing is not configured" };

  if (mode === "mock") {
    await auth.service
      .from("billing_subscriptions")
      .delete()
      .eq("organization_id", admitted.org.id)
      .like("id", "mock_%");
    return {
      ok: true,
      url: new URL(`${billingPath(admitted)}?portal=cancelled`, origin).toString(),
    };
  }

  const { data: customer } = await auth.service
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", admitted.org.id)
    .maybeSingle();
  if (!customer)
    return { ok: false, status: 409, error: "This organization has no billing account yet" };

  const session = await stripe<{ url: string }>("POST", "/v1/billing_portal/sessions", {
    customer: (customer as { stripe_customer_id: string }).stripe_customer_id,
    return_url: new URL(billingPath(admitted), origin).toString(),
  });
  if (!session.ok) return session;
  return { ok: true, url: session.data.url };
}

// ---------------------------------------------------------------------------
// Usage (per-call billing)
// ---------------------------------------------------------------------------

/**
 * Record usage against a metered price — the per-call half of billing, for
 * the API product surface. Sends a Stripe Billing Meter event on the
 * organization's customer; Stripe aggregates and invoices it.
 *
 * `identifier` makes a retry safe: Stripe drops a second event with the same
 * one, so pass something unique per billable unit (a request id).
 *
 * In mock mode nothing is sent and the call succeeds, so code that meters can
 * be written and exercised before a Stripe account exists.
 */
export async function reportUsage(
  admitted: AdmittedOrg,
  usage: UsageEvent,
): Promise<{ ok: true; recorded: boolean } | BillingFailure> {
  return reportUsageForOrganization(admitted.org.id, usage);
}

export interface UsageEvent {
  event: string;
  value?: number;
  identifier?: string;
  timestamp?: Date;
}

/**
 * `reportUsage` for trusted server jobs with no signed-in user, such as an
 * hourly cron flushing a usage ledger. Same rule as `getBillingForOrganization`:
 * never pass it an organization id taken from a request.
 */
export async function reportUsageForOrganization(
  organizationId: string,
  usage: UsageEvent,
): Promise<{ ok: true; recorded: boolean } | BillingFailure> {
  if (!/^[a-z0-9_.-]{1,100}$/i.test(usage.event))
    return { ok: false, status: 400, error: "Invalid meter event name" };
  const value = usage.value ?? 1;
  if (!Number.isInteger(value) || value < 0)
    return { ok: false, status: 400, error: "Usage must be a non-negative integer" };

  const mode = billingMode();
  if (mode === "mock") return { ok: true, recorded: false };
  if (mode === "off") return { ok: false, status: 503, error: "Billing is not configured" };

  const service = systemServiceClient();
  if (!service) return { ok: false, status: 503, error: "Supabase is not configured" };
  const { data: customer } = await service
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!customer)
    return { ok: false, status: 402, error: "This organization has no billing account" };

  const sent = await stripe("POST", "/v1/billing/meter_events", {
    event_name: usage.event,
    payload: {
      stripe_customer_id: (customer as { stripe_customer_id: string }).stripe_customer_id,
      value: String(value),
    },
    ...(usage.identifier ? { identifier: usage.identifier } : {}),
    timestamp: Math.floor((usage.timestamp ?? new Date()).getTime() / 1000),
  });
  if (!sent.ok) return sent;
  return { ok: true, recorded: true };
}

// ---------------------------------------------------------------------------
// The webhook's side: keeping the mirror current
// ---------------------------------------------------------------------------

/**
 * A service-role client with no user behind it, for callers with no session:
 * the webhook (Stripe's signature is the authentication) and the
 * `...ForOrganization` functions above (trusted server jobs). Request
 * handlers go through a guard instead.
 */
function systemServiceClient(): ServiceClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!isSupabaseConfigured() || !url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as ServiceClient;
}

/** The subscription ids an event concerns. Every event becomes "re-sync these". */
export function subscriptionIdsOf(event: {
  type: string;
  data: { object: Record<string, unknown> };
}): string[] {
  const object = event.data.object;
  const idOf = (value: unknown): string | null =>
    typeof value === "string"
      ? value
      : value && typeof value === "object" && "id" in value
        ? String((value as { id: unknown }).id)
        : null;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return [idOf(object.subscription)].filter((id): id is string => Boolean(id));
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return [idOf(object.id)].filter((id): id is string => Boolean(id));
    case "invoice.paid":
    case "invoice.payment_failed": {
      // `invoice.subscription` before 2025-03-31; `parent.subscription_details` after.
      const parent = object.parent as
        | { subscription_details?: { subscription?: unknown } }
        | undefined;
      return [idOf(object.subscription) ?? idOf(parent?.subscription_details?.subscription)].filter(
        (id): id is string => Boolean(id),
      );
    }
    default:
      return [];
  }
}

/** Which organization a Stripe subscription belongs to: the customer mapping, then its metadata. */
async function organizationOf(
  service: ServiceClient,
  sub: StripeSubscription,
): Promise<string | null> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { data } = await service
    .from("billing_customers")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (data) return (data as { organization_id: string }).organization_id;

  const fromMetadata = sub.metadata?.organization_id;
  if (!fromMetadata) return null;
  const { data: org } = await service
    .from("organizations")
    .select("id")
    .eq("id", fromMetadata)
    .maybeSingle();
  if (!org) return null;
  await service
    .from("billing_customers")
    .upsert(
      { organization_id: fromMetadata, stripe_customer_id: customerId },
      { onConflict: "organization_id", ignoreDuplicates: true },
    );
  return fromMetadata;
}

/**
 * Bring one subscription's mirror row in line with Stripe. Idempotent and
 * order-independent: it reads Stripe now, so a late `updated` event after a
 * `deleted` one cannot resurrect anything.
 */
export async function syncSubscription(
  subscriptionId: string,
): Promise<{ ok: true; action: string } | BillingFailure> {
  const service = systemServiceClient();
  if (!service) return { ok: false, status: 503, error: "Supabase is not configured" };

  const fetched = await stripe<StripeSubscription>(
    "GET",
    `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
  if (!fetched.ok) return fetched;
  const sub = fetched.data;

  if (isTerminal(sub.status)) {
    const { error } = await service.from("billing_subscriptions").delete().eq("id", sub.id);
    if (error) return { ok: false, status: 500, error: "Failed to update the subscription mirror" };
    return { ok: true, action: "removed" };
  }

  const organizationId = await organizationOf(service, sub);
  if (!organizationId) {
    // Not one of ours (another product on the same Stripe account), or a
    // customer this app never created. Acknowledge it so Stripe stops retrying.
    return { ok: true, action: "ignored" };
  }

  // A plan with usage has a flat item and metered ones; the flat item names
  // the plan when there is one, and every item shares the billing period.
  const catalogPrice = (i: (typeof sub.items.data)[number]) =>
    findPrice(i.price.lookup_key ?? "")?.price;
  const item =
    sub.items.data.find((i) => {
      const price = catalogPrice(i);
      return price !== undefined && !isMetered(price);
    }) ??
    sub.items.data.find((i) => catalogPrice(i) !== undefined) ??
    sub.items.data[0];
  const priceKey = item?.price.lookup_key ?? null;
  const periodStart = item?.current_period_start ?? sub.current_period_start;
  const periodEnd = item?.current_period_end ?? sub.current_period_end;

  const { error } = await service.from("billing_subscriptions").upsert({
    id: sub.id,
    organization_id: organizationId,
    status: sub.status,
    price_key: priceKey,
    plan_key: planForPriceKey(priceKey)?.key ?? null,
    quantity: item?.quantity ?? 1,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, status: 500, error: "Failed to update the subscription mirror" };
  return { ok: true, action: "upserted" };
}
