import { fail, json, withUser } from "@/lib/api";
import { acceptInvitation } from "@/lib/orgs";

export const POST = withUser<{ token: string }>(async (_req, user, ctx) => {
  const result = await acceptInvitation((await ctx.params).token, user);
  if (result.status === 404) return fail(404, "Invitation not found");
  if (result.status === 410) return fail(410, "Invitation expired or already used");
  if (result.status !== 200) return fail(500, "Could not accept invitation");
  return json({ org: { id: result.org.id, slug: result.org.slug, name: result.org.name } });
});
