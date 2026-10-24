import { apiOrg, apiSession, fail, guarded, isError } from "@/lib/api";
import { isStripeConfigured } from "@/lib/env";
import { requestOrigin } from "@/lib/http";
import { listMembers } from "@/lib/orgs/service";
import { canManage } from "@/lib/orgs/types";
import { createTeamCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const POST = guarded(async (request: Request, context: { params: Promise<{ org: string }> }) => {
  const { org: slug } = await context.params;
  const session = await apiSession();
  if (isError(session)) return session;
  const org = await apiOrg(session, slug);
  if (isError(org)) return org;
  if (!canManage(org.role)) return fail(403, "Only owners and admins can upgrade the plan");
  if (!isStripeConfigured()) return fail(503, "Stripe is not configured");

  // The Team price is per member, so the quantity is the current member count.
  const members = await listMembers(session.sb, org.id);
  const url = await createTeamCheckoutSession({
    orgId: org.id,
    slug: org.slug,
    quantity: members.length,
    origin: requestOrigin(request.headers),
  });
  return Response.json({ url });
});
