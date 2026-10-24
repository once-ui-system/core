/**
 * Plans and Stripe Checkout (server-only).
 *
 * An organization is on `free` or `team`. Owners and admins start an upgrade:
 * a Checkout session in subscription mode for STRIPE_PRICE_TEAM, quantity =
 * the organization's member count, with the organization's id as
 * `client_reference_id`. The Stripe webhook moves the organization to `team`
 * when that session completes.
 */
import { createClient } from "@supabase/supabase-js";
import { type AdmittedOrg, type OrgGuardFailure, resolveUserAndService } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { supabaseSecretKey } from "@/lib/sb/config";
import { stripe, stripeSecretKey } from "./stripe";

/** Postgres "invalid input syntax": a malformed id, so no organization matches it. */
const INVALID_TEXT_REPRESENTATION = "22P02";

/** A Checkout session's URL, as Stripe returns it. */
type CheckoutSession = { id: string; url: string | null };

/**
 * A Stripe Checkout session for the Team plan, as a URL to redirect to.
 * Owners and admins only: the caller has already passed `requireOrgAdmin`.
 */
export async function startCheckout(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | OrgGuardFailure> {
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!stripeSecretKey() || !price) {
    return { ok: false, status: 503, error: "Billing is not configured. See .env.example." };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  // The Team plan is priced per member, so the quantity is the member count.
  const { count } = await auth.service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", admitted.org.id);
  const quantity = Math.max(1, count ?? 1);

  const slug = admitted.org.slug;
  const result = await stripe<CheckoutSession>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: admitted.org.id,
    line_items: [{ price, quantity }],
    success_url: `${origin}${orgPath(slug, "/settings")}?upgraded=1`,
    cancel_url: `${origin}${orgPath(slug, "/settings")}`,
  });
  if (!result.ok) return result;
  if (!result.data.url) {
    return { ok: false, status: 502, error: "The payment provider did not return a checkout link" };
  }
  return { ok: true, url: result.data.url };
}

/**
 * Set an organization's plan. Called by the webhook, which has no user
 * session, so it uses the service-role key directly. An id that is not a
 * uuid matches no organization and is not an error.
 */
export async function setOrganizationPlan(
  organizationId: string,
  plan: "free" | "team",
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!url || !key) return { ok: false, status: 500, error: "Supabase is not configured" };

  const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await service
    .from("organizations")
    .update({ plan })
    .eq("id", organizationId);

  if (error && error.code !== INVALID_TEXT_REPRESENTATION) {
    return { ok: false, status: 500, error: "Failed to update the plan" };
  }
  return { ok: true };
}
