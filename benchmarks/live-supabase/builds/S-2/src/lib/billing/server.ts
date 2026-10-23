/**
 * Organization billing (server-only).
 *
 * The customer is the organization: its plan is the `plan` column of
 * `organizations`, `free` until a Team checkout completes. Checkout creates a
 * Stripe Checkout session in subscription mode for STRIPE_PRICE_TEAM with the
 * organization's id as `client_reference_id`; the webhook
 * (src/app/api/webhooks/stripe) reads it back and sets the plan.
 */
import type { AdmittedOrg, OrgGuardFailure } from "@/lib/orgs/server";
import { supabaseSecretKey } from "@/lib/sb/config";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "./stripe";

/** A Postgres uuid, so an id from a webhook payload never reaches a query malformed. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A service-role client for jobs with no signed-in user (the webhook). */
function systemServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Start a Team checkout for an organization a guard admitted the caller to as admin. */
export async function startCheckout(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | OrgGuardFailure> {
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!price) return { ok: false, status: 503, error: "STRIPE_PRICE_TEAM is not set" };

  const settings = `${origin}/app/${encodeURIComponent(admitted.org.slug)}/settings`;
  const session = await stripe<{ url?: string | null }>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: admitted.org.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${settings}?upgraded=1`,
    cancel_url: settings,
    metadata: { organization_id: admitted.org.id },
  });
  if (!session.ok) return session;
  if (!session.data.url) return { ok: false, status: 502, error: "The payment provider sent no checkout URL" };
  return { ok: true, url: session.data.url };
}

type CheckoutSession = {
  client_reference_id?: string | null;
  customer?: string | null;
  subscription?: string | null;
};

/** `checkout.session.completed`: the organization in `client_reference_id` goes on the Team plan. */
export async function applyCheckoutCompleted(
  session: CheckoutSession,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = session.client_reference_id;
  if (!id || !UUID.test(id)) return { ok: true }; // not one of ours

  const service = systemServiceClient();
  if (!service) return { ok: false, error: "Supabase is not configured" };

  const { error } = await service
    .from("organizations")
    .update({
      plan: "team",
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
    })
    .eq("id", id);
  return error ? { ok: false, error: "Failed to update the plan" } : { ok: true };
}

/** `customer.subscription.deleted`: back to Free. */
export async function applySubscriptionDeleted(
  subscriptionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const service = systemServiceClient();
  if (!service) return { ok: false, error: "Supabase is not configured" };

  const { error } = await service
    .from("organizations")
    .update({ plan: "free", stripe_subscription_id: null })
    .eq("stripe_subscription_id", subscriptionId);
  return error ? { ok: false, error: "Failed to update the plan" } : { ok: true };
}
