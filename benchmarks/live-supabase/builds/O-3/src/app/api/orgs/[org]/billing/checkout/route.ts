import { fail, json, orgFor, withUser } from "@/lib/api";
import { canManage } from "@/lib/orgs";
import { createCheckoutSession } from "@/lib/stripe";

export const POST = withUser<{ org: string }>(async (req, user, ctx) => {
  const org = await orgFor((await ctx.params).org, user);
  if (org instanceof Response) return org;
  if (!canManage(org.role)) return fail(403, "Only owners and admins can manage billing");
  const origin = new URL(req.url).origin;
  try {
    const session = await createCheckoutSession({
      orgId: org.id,
      email: user.email ?? undefined,
      successUrl: `${origin}/app/${org.slug}/settings?upgraded=1`,
      cancelUrl: `${origin}/app/${org.slug}/settings`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error(e);
    return fail(502, "Could not start checkout");
  }
});
