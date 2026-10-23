/**
 * Organization billing (server-only).
 *
 * An organization is on `free` or `team` (the `plan` column). Upgrading is a
 * Stripe Checkout session in subscription mode for STRIPE_PRICE_TEAM, with the
 * organization's id as `client_reference_id`; the webhook flips the plan when
 * Stripe reports the session completed.
 */
import { type AdmittedOrg, type OrgGuardFailure } from "@/lib/orgs/server";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import type { ServiceClient } from "@/lib/sb/service";
import { createClient } from "@supabase/supabase-js";
import { stripePost, stripeSecretKey } from "./stripe";

export async function startCheckout(
  admitted: AdmittedOrg,
  origin: string,
): Promise<{ ok: true; url: string } | OrgGuardFailure> {
  if (admitted.role !== "owner" && admitted.role !== "admin") {
    return { ok: false, status: 403, error: "Admin or owner access required" };
  }
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!stripeSecretKey() || !price) {
    return { ok: false, status: 503, error: "Billing is not configured" };
  }

  const settings = new URL(`/app/${admitted.org.slug}/settings`, origin);
  const success = new URL(settings);
  success.searchParams.set("checkout", "success");
  const cancel = new URL(settings);
  cancel.searchParams.set("checkout", "cancelled");

  const session = await stripePost<{ url: string | null }>("/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: admitted.org.id,
    line_items: [{ price, quantity: 1 }],
    success_url: success.toString(),
    cancel_url: cancel.toString(),
  });
  if (!session.ok) return session;
  if (!session.data.url) {
    return { ok: false, status: 502, error: "The payment provider returned no checkout page" };
  }
  return { ok: true, url: session.data.url };
}

/** A service-role client with no user behind it, for the webhook (Stripe's signature is the authentication). */
export function systemServiceClient(): ServiceClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseSecretKey();
  if (!isSupabaseConfigured() || !url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as ServiceClient;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Put an organization on the Team plan. Returns false when no such organization exists. */
export async function setTeamPlan(
  organizationId: string,
): Promise<{ ok: true; updated: boolean } | OrgGuardFailure> {
  if (!UUID.test(organizationId)) return { ok: true, updated: false };
  const service = systemServiceClient();
  if (!service) return { ok: false, status: 503, error: "Supabase is not configured" };

  const { data, error } = await service
    .from("organizations")
    .update({ plan: "team" })
    .eq("id", organizationId)
    .select("id");
  if (error) return { ok: false, status: 500, error: "Failed to update the plan" };
  return { ok: true, updated: (data ?? []).length > 0 };
}
