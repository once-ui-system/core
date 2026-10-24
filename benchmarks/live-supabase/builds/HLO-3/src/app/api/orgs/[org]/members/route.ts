import { getViewer, listMembers, orgAccess } from "@/lib/orgs";
import { errorJson, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const access = await orgAccess(viewer, slug);
  if (!access) return errorJson("Organization not found.", 404);

  const members = await listMembers(access.id);
  return json(members.map((m) => ({ user_id: m.user_id, email: m.email, role: m.role })));
}
