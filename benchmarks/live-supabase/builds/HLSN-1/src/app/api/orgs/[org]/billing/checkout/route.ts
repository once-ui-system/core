import { NextResponse } from "next/server";
import { apiError, guarded } from "@/lib/api";
import { apiAccess } from "@/lib/orgs/guard";
import { countMembers } from "@/lib/orgs/data";
import { createTeamCheckout, stripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/**
 * Starts a Stripe Checkout session (subscription mode) for the Team price,
 * one unit per member. Answers { url }; the browser goes there to pay.
 * Owners and admins only.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  return guarded("POST /api/orgs/[org]/billing/checkout", async () => {
    const access = await apiAccess(slug, "manage");
    if (!access.ok) return access.response;

    if (!stripeConfigured()) {
      return apiError(503, "not_configured", "Stripe is not configured.");
    }

    const quantity = await countMembers(access.org.id);
    const origin = new URL(request.url).origin;
    const result = await createTeamCheckout({
      orgId: access.org.id,
      slug: access.org.slug,
      quantity,
      origin,
    });
    if (!result.ok) return apiError(result.status, "checkout_failed", result.error);

    return NextResponse.json({ url: result.url }, { status: 200 });
  });
}
