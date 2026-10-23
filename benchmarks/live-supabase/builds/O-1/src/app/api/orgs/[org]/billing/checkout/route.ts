import { fail, json, requireOrg } from "../../../../../../lib/api";
import { canManage, siteOrigin } from "../../../../../../lib/orgs";
import { createTeamCheckout } from "../../../../../../lib/stripe";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await params).org);
  if (g.res) return g.res;
  if (!canManage(g.org.role)) return fail(403, "Only owners and admins can upgrade");
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_TEAM) return fail(503, "Stripe is not configured");
  const origin = siteOrigin(request);
  try {
    const url = await createTeamCheckout({
      orgId: g.org.id,
      successUrl: `${origin}/app/${g.org.slug}/settings?upgraded=1`,
      cancelUrl: `${origin}/app/${g.org.slug}/settings`,
      email: g.user.email || undefined,
    });
    return json({ url });
  } catch (e) {
    return fail(502, e instanceof Error ? e.message : "Stripe error");
  }
}
