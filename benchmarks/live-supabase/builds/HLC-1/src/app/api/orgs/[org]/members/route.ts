import { apiOrg, json } from "@/lib/api";
import { listMembers } from "@/lib/orgs/data";

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await apiOrg(slug);
  if (ctx instanceof Response) return ctx;
  const members = await listMembers(ctx.supabase, ctx.org.id);
  return json(members.map(({ user_id, email, role }) => ({ user_id, email, role })));
}
