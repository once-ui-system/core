import { fail, json, orgFor, withUser } from "@/lib/api";
import { canManage, createInvitation } from "@/lib/orgs";

export const POST = withUser<{ org: string }>(async (req, user, ctx) => {
  const org = await orgFor((await ctx.params).org, user);
  if (org instanceof Response) return org;
  if (!canManage(org.role)) return fail(403, "Only owners and admins can invite");
  const body = (await req.json().catch(() => null)) as { email?: unknown; role?: unknown } | null;
  const role = body?.role;
  if (role !== "member" && role !== "admin") return fail(400, "role must be member or admin");
  let email: string | undefined;
  if (body?.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+$/.test(body.email.trim())) {
      return fail(400, "email is not valid");
    }
    email = body.email.trim();
  }
  const inv = await createInvitation(org.id, user.id, role, email);
  const origin = new URL(req.url).origin;
  return json({ token: inv.token, url: `${origin}/invite/${inv.token}` }, 201);
});
