import { apiOrg, json } from "@/lib/api";
import { listMembers } from "@/lib/orgs/data";
import { canManage } from "@/lib/orgs/types";
import { createTeamCheckoutSession, StripeError } from "@/lib/stripe";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await apiOrg(slug);
  if (ctx instanceof Response) return ctx;
  if (!canManage(ctx.org.role)) return json({ error: "Only owners and admins can upgrade" }, 403);

  const origin = new URL(request.url).origin;
  const members = await listMembers(ctx.supabase, ctx.org.id);
  try {
    const session = await createTeamCheckoutSession({
      orgId: ctx.org.id,
      quantity: members.length,
      successUrl: `${origin}/app/${ctx.org.slug}/settings?checkout=success`,
      cancelUrl: `${origin}/app/${ctx.org.slug}/settings?checkout=cancelled`,
    });
    return json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeError && error.message === "Billing is not configured") {
      return json({ error: error.message }, 503);
    }
    return json({ error: "Could not start checkout" }, 502);
  }
}
