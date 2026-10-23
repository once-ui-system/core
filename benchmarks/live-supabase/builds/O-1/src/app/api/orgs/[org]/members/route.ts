import { json, requireOrg } from "../../../../../lib/api";
import { listMembers } from "../../../../../lib/orgs";

export async function GET(_req: Request, { params }: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await params).org);
  if (g.res) return g.res;
  return json(await listMembers(g.org.id));
}
