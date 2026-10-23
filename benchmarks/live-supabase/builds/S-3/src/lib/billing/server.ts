/**
 * Organization billing (server-only). The customer is the organization: its
 * `plan` column is `free` until a Checkout session for the Team price
 * completes, which the Stripe webhook records.
 */
import type { AdmittedOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { createClient } from "@supabase/supabase-js";
import { stripe, stripeSecretKey } from "./stripe";

type Failure = { ok: false; status: number; error: string };

/** Billing is live when the secret key and the Team price id are both set. */
export function billingConfigured(): boolean {
  return Boolean(stripeSecretKey() && process.env.STRIPE_PRICE_TEAM);
}

/** A service-role client for work no user session is behind (the webhook). */
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!isSupabaseConfigured() || !url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Start a subscription Checkout for the Team plan on an organization a guard
 * admitted the caller to as an admin. The organization's id travels as the
 * session's `client_reference_id`, which is how the webhook finds it again.
 */
export async function startCheckout(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | Failure> {
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!stripeSecretKey() || !price) {
    return { ok: false, status: 503, error: "Billing is not configured" };
  }

  const settings = `${origin}/app/${admitted.org.slug}/settings`;
  const session = await stripe<{ url?: string | null }>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: admitted.org.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${settings}?checkout=success`,
    cancel_url: `${settings}?checkout=cancelled`,
  });
  if (!session.ok) return session;
  if (!session.data.url) return { ok: false, status: 502, error: "The payment provider sent no checkout link" };

  return { ok: true, url: session.data.url };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Put an organization on the Team plan. An unknown id is not an error: Stripe must not retry it. */
export async function activateTeamPlan(
  organizationId: unknown,
): Promise<{ ok: true } | Failure> {
  if (typeof organizationId !== "string" || !UUID.test(organizationId)) return { ok: true };

  const service = serviceClient();
  if (!service) return { ok: false, status: 503, error: "Supabase is not configured" };

  const { error } = await service.from("organizations").update({ plan: "team" }).eq("id", organizationId);
  if (error) return { ok: false, status: 500, error: "Failed to update the plan" };
  return { ok: true };
}
