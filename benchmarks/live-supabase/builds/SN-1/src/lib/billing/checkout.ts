/**
 * Plans and checkout (server-only).
 *
 * An organization is on `free` or `team` (the `plan` column). Checkout opens
 * a Stripe subscription Checkout session for the Team price and tags it with
 * the organization's id; the webhook moves the plan when the session
 * completes. Stripe calls go to STRIPE_API_BASE when it is set.
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey } from "@/lib/sb/config";
import type { AdmittedOrg } from "@/lib/orgs/server";
import { resolveUserAndService } from "@/lib/orgs/server";
import { stripe, stripeSecretKey } from "./stripe";

interface CheckoutSession {
  id: string;
  url?: string | null;
}

export async function startCheckout(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | { ok: false; status: number; error: string }> {
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!stripeSecretKey() || !price) {
    return { ok: false, status: 503, error: "Billing is not configured. See .env.example." };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { count } = await auth.service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", admitted.org.id);

  const back = `${origin}/app/${admitted.org.slug}/settings`;
  const result = await stripe<CheckoutSession>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: admitted.org.id,
    line_items: [{ price, quantity: Math.max(1, count ?? 1) }],
    success_url: `${back}?checkout=success`,
    cancel_url: `${back}?checkout=cancelled`,
    metadata: { organization_id: admitted.org.id },
  });
  if (!result.ok) return result;

  return { ok: true, url: result.data.url || `${back}?checkout=pending` };
}

/** Put an organization on the Team plan. Used by the webhook only. */
export async function setPlanTeam(
  organizationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = serviceOnly();
  if (!auth) return { ok: false, error: "Supabase is not configured" };

  const { error } = await auth
    .from("organizations")
    .update({ plan: "team" })
    .eq("id", organizationId);
  if (error) return { ok: false, error: "Failed to update the plan" };
  return { ok: true };
}

function serviceOnly() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
