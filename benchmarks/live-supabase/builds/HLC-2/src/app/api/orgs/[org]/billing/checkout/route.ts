import { errorResponse, json, requireApiViewer } from "@/lib/api";
import { getOrgAccess } from "@/lib/orgs/queries";
import { canManage } from "@/lib/orgs/types";
import { createTeamCheckoutUrl } from "@/lib/stripe/checkout";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const viewer = await requireApiViewer();
  if (viewer instanceof Response) return viewer;
  const { org: slug } = await params;

  try {
    const access = await getOrgAccess(viewer.id, slug);
    if (!access) return json({ error: "not found" }, 404);
    if (!canManage(access.role)) return json({ error: "only owners and admins upgrade" }, 403);

    const url = await createTeamCheckoutUrl({
      orgId: access.org.id,
      slug: access.org.slug,
      origin: new URL(request.url).origin,
    });
    return json({ url });
  } catch (error) {
    return errorResponse(error);
  }
}
