import { json, orgFor, withUser } from "@/lib/api";
import { listMembers } from "@/lib/orgs";

export const GET = withUser<{ org: string }>(async (_req, user, ctx) => {
  const org = await orgFor((await ctx.params).org, user);
  if (org instanceof Response) return org;
  return json(await listMembers(org.id));
});
