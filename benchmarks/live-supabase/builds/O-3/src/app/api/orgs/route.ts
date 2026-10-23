import { fail, json, withUser } from "@/lib/api";
import { createOrg } from "@/lib/orgs";

export const POST = withUser(async (req, user) => {
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return fail(400, "name is required (up to 80 characters)");
  const org = await createOrg(user, name);
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
});
