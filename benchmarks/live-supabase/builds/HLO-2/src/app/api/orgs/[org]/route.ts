import { apiOrg, apiSession, guarded, isError } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = guarded(async (_request: Request, context: { params: Promise<{ org: string }> }) => {
  const { org: slug } = await context.params;
  const session = await apiSession();
  if (isError(session)) return session;
  const org = await apiOrg(session, slug);
  if (isError(org)) return org;
  return Response.json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: org.role });
});
