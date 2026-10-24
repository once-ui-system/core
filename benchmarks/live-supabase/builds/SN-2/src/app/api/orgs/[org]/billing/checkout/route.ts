import { stripe } from "@/lib/billing/stripe";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/**
 * Start a Stripe Checkout session (subscription mode) for the Team plan.
 * Owners and admins only. The organization's id travels as the session's
 * `client_reference_id`, which is how the webhook finds the organization.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const price = process.env.STRIPE_PRICE_TEAM;
  if (!process.env.STRIPE_SECRET_KEY || !price) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const settings = `${origin}${orgPath(guard.org.slug, "/settings")}`;
  const result = await stripe<{ url?: string | null }>("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: guard.org.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${settings}?checkout=success`,
    cancel_url: `${settings}?checkout=cancelled`,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  if (!result.data.url) {
    return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
  }

  return NextResponse.json({ url: result.data.url }, { status: 200 });
}
