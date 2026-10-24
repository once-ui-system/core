import { apiSession, fail, guarded, isError } from "@/lib/api";
import { acceptInvitation } from "@/lib/orgs/service";

export const dynamic = "force-dynamic";

export const POST = guarded(async (_request: Request, context: { params: Promise<{ token: string }> }) => {
  const { token } = await context.params;
  const session = await apiSession();
  if (isError(session)) return session;
  const org = await acceptInvitation(session.sb, token);
  if (!org) return fail(404, "This invitation is invalid or has expired");
  return Response.json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: org.role });
});
