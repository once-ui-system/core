import { canManage, getViewer, listMembers, orgAccess } from "@/lib/orgs";
import { errorJson, json } from "@/lib/api";
import { isStripeConfigured } from "@/lib/env";
import { createTeamCheckout } from "@/lib/stripe";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const access = await orgAccess(viewer, slug);
  if (!access) return errorJson("Organization not found.", 404);
  if (!canManage(access)) return errorJson("Only owners and admins can change the plan.", 403);
  if (access.plan === "team") return errorJson("This organization is already on the Team plan.", 409);
  if (!isStripeConfigured()) return errorJson("Billing is not configured.", 503);

  const members = await listMembers(access.id);
  const origin = new URL(request.url).origin;
  try {
    const { url } = await createTeamCheckout({
      orgId: access.id,
      seats: members.length,
      successUrl: `${origin}/app/${access.slug}/settings?billing=success`,
      cancelUrl: `${origin}/app/${access.slug}/settings?billing=cancelled`,
    });
    return json({ url });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Checkout could not be created.", 502);
  }
}
