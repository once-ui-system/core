import { errorResponse, json, requireApiViewer } from "@/lib/api";
import { getOrgAccess } from "@/lib/orgs/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const viewer = await requireApiViewer();
  if (viewer instanceof Response) return viewer;
  const { org: slug } = await params;

  try {
    const access = await getOrgAccess(viewer.id, slug);
    if (!access) return json({ error: "not found" }, 404);
    const { id, name, plan } = access.org;
    return json({ id, slug: access.org.slug, name, plan, role: access.role });
  } catch (error) {
    return errorResponse(error);
  }
}
