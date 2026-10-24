import { acceptInvitation, getViewer } from "@/lib/orgs";
import { errorJson, json } from "@/lib/api";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const result = await acceptInvitation(viewer, token);
  if (result.status === "not_found") return errorJson("This invitation does not exist.", 404);
  if (result.status === "expired") return errorJson("This invitation has expired.", 410);
  return json({ id: result.id, slug: result.slug, name: result.name, role: result.role });
}
