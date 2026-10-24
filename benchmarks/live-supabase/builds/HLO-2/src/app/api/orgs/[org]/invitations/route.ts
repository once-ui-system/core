import { apiOrg, apiSession, fail, guarded, isError, readJson } from "@/lib/api";
import { requestOrigin } from "@/lib/http";
import { createInvitation } from "@/lib/orgs/service";
import { canManage, INVITE_ROLES, type InviteRole } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const POST = guarded(async (request: Request, context: { params: Promise<{ org: string }> }) => {
  const { org: slug } = await context.params;
  const session = await apiSession();
  if (isError(session)) return session;
  const org = await apiOrg(session, slug);
  if (isError(org)) return org;
  if (!canManage(org.role)) return fail(403, "Only owners and admins can invite people");

  const body = await readJson(request);
  if (!body) return fail(400, "Send a JSON object");
  const role = body.role as InviteRole;
  if (!INVITE_ROLES.includes(role)) return fail(400, 'role must be "member" or "admin"');
  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || !body.email.includes("@")) return fail(400, "email is not valid");
    email = body.email.trim().toLowerCase();
  }

  const token = await createInvitation(session.sb, {
    orgId: org.id,
    createdBy: session.userId,
    email,
    role,
  });
  const url = `${requestOrigin(request.headers)}/invite/${token}`;
  return Response.json({ token, url }, { status: 201 });
});
