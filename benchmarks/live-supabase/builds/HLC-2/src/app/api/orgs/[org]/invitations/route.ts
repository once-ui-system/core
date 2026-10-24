import { errorResponse, json, readJson, requireApiViewer } from "@/lib/api";
import { createInvitation } from "@/lib/orgs/actions";
import { getOrgAccess } from "@/lib/orgs/queries";
import { canManage } from "@/lib/orgs/types";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const viewer = await requireApiViewer();
  if (viewer instanceof Response) return viewer;
  const { org: slug } = await params;

  const body = await readJson(request);
  if (!body) return json({ error: "body must be a JSON object" }, 400);
  if (body.role !== "member" && body.role !== "admin") {
    return json({ error: 'role must be "member" or "admin"' }, 400);
  }
  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || !body.email.includes("@")) {
      return json({ error: "email must be an address" }, 400);
    }
    email = body.email.trim();
  }

  try {
    const access = await getOrgAccess(viewer.id, slug);
    if (!access) return json({ error: "not found" }, 404);
    if (!canManage(access.role)) return json({ error: "only owners and admins invite people" }, 403);

    const { token } = await createInvitation(viewer.id, access.org, body.role, access.role, email);
    const origin = new URL(request.url).origin;
    return json({ token, url: `${origin}/invite/${token}` }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
