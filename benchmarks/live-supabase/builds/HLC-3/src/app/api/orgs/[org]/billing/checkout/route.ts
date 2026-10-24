import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/orgs/access";
import { createTeamCheckoutSession, StripeError, stripeConfigured } from "@/lib/stripe/client";
import { jsonError } from "@/lib/http";

type Params = { params: Promise<{ org: string }> };

// Starts a Stripe Checkout session (subscription mode, Team price). Owners and admins only.
// Returns { url }, the Checkout URL to send the browser to.
export async function POST(request: Request, { params }: Params) {
  const { org: slug } = await params;
  const guard = await apiGuard(slug, { manage: true });
  if (!guard.ok) return guard.response;
  if (!stripeConfigured()) return jsonError(503, "Stripe is not configured");

  const { count, error } = await guard.supabase
    .from("memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("org_id", guard.org.id);
  if (error) return jsonError(500, error.message);

  const origin = new URL(request.url).origin;
  const base = `${origin}/app/${guard.org.slug}/settings`;
  try {
    const session = await createTeamCheckoutSession({
      orgId: guard.org.id,
      quantity: count ?? 1,
      successUrl: `${base}?billing=success`,
      cancelUrl: `${base}?billing=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof StripeError) return jsonError(err.status, err.message);
    return jsonError(500, "Could not start checkout");
  }
}
