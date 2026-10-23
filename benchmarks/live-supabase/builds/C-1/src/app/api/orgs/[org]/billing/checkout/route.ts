import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/orgs";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request, ctx: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await ctx.params).org, { manage: true });
  if (!g.ok) return g.response;
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!price || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: g.org.id,
      success_url: `${origin}/app/${g.org.slug}/settings?billing=success`,
      cancel_url: `${origin}/app/${g.org.slug}/settings?billing=cancelled`,
    });
    if (!session.url) throw new Error("Checkout session has no URL");
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
