import { stripePost } from "@/lib/billing/stripe";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** Start a Stripe Checkout session (subscription) for the Team plan. */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const price = process.env.STRIPE_PRICE_TEAM;
  if (!price || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const back = `${origin}/app/${guard.org.slug}/settings`;
  const session = await stripePost<{ url?: string | null }>("/v1/checkout/sessions", {
    mode: "subscription",
    client_reference_id: guard.org.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${back}?upgraded=1`,
    cancel_url: back,
  });
  if (!session.ok) return NextResponse.json({ error: session.error }, { status: session.status });
  if (!session.data.url) {
    return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
  }

  return NextResponse.json({ url: session.data.url }, { status: 200 });
}
