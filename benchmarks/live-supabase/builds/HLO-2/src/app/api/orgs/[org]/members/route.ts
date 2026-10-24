import { apiOrg, apiSession, guarded, isError } from "@/lib/api";
import { listMembers } from "@/lib/orgs/service";

export const dynamic = "force-dynamic";

export const GET = guarded(async (_request: Request, context: { params: Promise<{ org: string }> }) => {
  const { org: slug } = await context.params;
  const session = await apiSession();
  if (isError(session)) return session;
  const org = await apiOrg(session, slug);
  if (isError(org)) return org;
  const members = await listMembers(session.sb, org.id);
  return Response.json(members.map((m) => ({ user_id: m.user_id, email: m.email, role: m.role })));
});
