import { authorize, json, originOf, readJson } from "@/lib/api";
import { canManage, createInvitation } from "@/lib/orgs";

export async function POST(req: Request, { params }: { params: Promise<{ org: string }> }) {
  const a = await authorize((await params).org);
  if (a instanceof Response) return a;
  const { org, role } = a.ctx!;
  if (!canManage(role)) return json({ error: "Forbidden" }, 403);
  const body = await readJson(req);
  const inviteRole = body.role;
  if (inviteRole !== "member" && inviteRole !== "admin") return json({ error: "role must be member or admin" }, 400);
  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+$/.test(body.email.trim()))
      return json({ error: "Invalid email" }, 400);
    email = body.email.trim();
  }
  try {
    const token = await createInvitation(org, a.user, inviteRole, email);
    return json({ token, url: `${originOf(req)}/invite/${token}` }, 201);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Could not create invitation" }, 500);
  }
}
