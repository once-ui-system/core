import { authorize, json, originOf } from "@/lib/api";
import { canManage } from "@/lib/orgs";
import { stripePost } from "@/lib/stripe";

export async function POST(req: Request, { params }: { params: Promise<{ org: string }> }) {
  const a = await authorize((await params).org);
  if (a instanceof Response) return a;
  const { org, role } = a.ctx!;
  if (!canManage(role)) return json({ error: "Forbidden" }, 403);
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!price || !process.env.STRIPE_SECRET_KEY) return json({ error: "Billing is not configured" }, 503);
  const origin = originOf(req);
  try {
    const session = await stripePost<{ url: string | null }>("/v1/checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      client_reference_id: org.id,
      success_url: `${origin}/app/${org.slug}/settings?upgraded=1`,
      cancel_url: `${origin}/app/${org.slug}/settings`,
    });
    return json({ url: session.url });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Stripe error" }, 502);
  }
}
