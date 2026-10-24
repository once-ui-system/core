import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs/guard";
import { isStripeConfigured } from "@/lib/env";
import { createAdminSupabase } from "@/lib/supabase/server";
import { createTeamCheckoutSession } from "@/lib/stripe";

type Params = { params: Promise<{ org: string }> };

/**
 * POST /api/orgs/{org}/billing/checkout: a Stripe Checkout URL that upgrades the
 * organization to Team. Owners and admins only.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId, "admin");
  if (!check.ok) return apiError(check.status, check.code, check.message);

  if (!isStripeConfigured()) {
    return apiError(503, "not_configured", "Billing is not configured. See .env.example.");
  }
  if (check.org.plan === "team") {
    return apiError(409, "already_on_team", "This organization is already on the Team plan");
  }

  const { count } = await check.admin
    .from("memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", check.org.id);

  const base = new URL(request.url).origin;
  const path = `/app/${check.org.slug}/settings`;
  const result = await createTeamCheckoutSession({
    organizationId: check.org.id,
    seats: count ?? 1,
    successUrl: `${base}${path}?upgraded=1`,
    cancelUrl: `${base}${path}`,
  });
  if (!result.ok) return apiError(502, "payment_provider", result.error);
  return NextResponse.json({ url: result.url });
}
