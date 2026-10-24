import { getViewer, orgAccess } from "@/lib/orgs";
import { errorJson, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const access = await orgAccess(viewer, slug);
  if (!access) return errorJson("Organization not found.", 404);

  return json({ id: access.id, slug: access.slug, name: access.name, plan: access.plan, role: access.role });
}
