import { canManage, createInvitation, getViewer, orgAccess } from "@/lib/orgs";
import { errorJson, json, readBody } from "@/lib/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const access = await orgAccess(viewer, slug);
  if (!access) return errorJson("Organization not found.", 404);
  if (!canManage(access)) return errorJson("Only owners and admins can invite people.", 403);

  const body = await readBody(request);
  const role = body.role;
  if (role !== "member" && role !== "admin") return errorJson('role must be "member" or "admin".', 400);

  const email = typeof body.email === "string" && body.email.trim() !== "" ? body.email.trim().toLowerCase() : null;
  if (email !== null && !EMAIL.test(email)) return errorJson("email is not a valid address.", 400);

  const { token, expires_at } = await createInvitation(viewer, access.id, email, role);
  const url = `${new URL(request.url).origin}/invite/${token}`;
  return json({ token, url, expires_at }, 201);
}
