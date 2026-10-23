import { fail, json, readJson, requireOrg } from "../../../../../lib/api";
import { canManage, createInvitation, siteOrigin } from "../../../../../lib/orgs";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await params).org);
  if (g.res) return g.res;
  if (!canManage(g.org.role)) return fail(403, "Only owners and admins can invite");
  const body = await readJson(request);
  const role = body.role;
  if (role !== "member" && role !== "admin") return fail(400, "role must be member or admin");
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email && !/^[^@\s]+@[^@\s]+$/.test(email)) return fail(400, "Invalid email");
  const token = await createInvitation(g.org, g.user.id, role, email || undefined);
  return json({ token, url: `${siteOrigin(request)}/invite/${token}` }, 201);
}
