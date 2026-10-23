import { json, listMembers, withOrg } from "../../../../../lib/orgs";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  return withOrg(slug, {}, async ({ org }) => {
    const members = await listMembers(org.id);
    return json(members.map(({ user_id, email, role }) => ({ user_id, email, role })));
  });
}
