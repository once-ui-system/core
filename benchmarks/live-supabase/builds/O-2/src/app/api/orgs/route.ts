import { adminClient, currentUser } from "../../../lib/supabase/server";
import { json, slugify, unauthorized, userOrgs } from "../../../lib/orgs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return json({ error: "A name of 1 to 120 characters is required" }, 400);

  const db = adminClient();
  let org: { id: string; slug: string; name: string } | null = null;
  for (let i = 0; i < 3 && !org; i++) {
    const { data, error } = await db
      .from("organizations")
      .insert({ name, slug: slugify(name), created_by: user.id })
      .select("id, slug, name")
      .single();
    if (data) org = data;
    else if (error?.code !== "23505") return json({ error: "Could not create the organization" }, 500);
  }
  if (!org) return json({ error: "Could not create the organization" }, 500);

  const { error } = await db
    .from("memberships")
    .insert({ org_id: org.id, user_id: user.id, email: user.email ?? "", role: "owner" });
  if (error) {
    await db.from("organizations").delete().eq("id", org.id);
    return json({ error: "Could not create the organization" }, 500);
  }
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
}

export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  const orgs = await userOrgs(user.id);
  return json(orgs.map(({ id, slug, name, plan, role }) => ({ id, slug, name, plan, role })));
}
