import { headers } from "next/headers";
import { getCurrentUser, originOf } from "@/lib/auth";
import { apiError, json } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs";
import { createTeamCheckoutSession, stripeConfigured } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Context = { params: Promise<{ org: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!isSupabaseConfigured()) return apiError(503, "Supabase is not configured.");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in first.");
  if (!stripeConfigured()) return apiError(503, "Stripe is not configured.");

  const { org } = await params;
  const access = await checkOrgAccess(org, user.id, true);
  if (!access.ok) {
    return apiError(access.status, access.status === 404 ? "Not found." : "Only owners and admins can upgrade the plan.");
  }
  if (access.access.plan === "team") return apiError(409, "This organization is already on the Team plan.");

  const origin = originOf(await headers());
  const url = await createTeamCheckoutSession({
    orgId: access.access.id,
    successUrl: `${origin}/app/${access.access.slug}/settings?billing=success`,
    cancelUrl: `${origin}/app/${access.access.slug}/settings?billing=cancelled`,
    stripeCustomerId: null,
  });
  return json({ url });
}
