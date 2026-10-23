import { adminClient } from "../../../../lib/supabase/server";
import { json, withOrg } from "../../../../lib/orgs";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ org: string }> };

export async function GET(_req: Request, { params }: P) {
  const { org: slug } = await params;
  return withOrg(slug, {}, async ({ org }) =>
    json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: org.role }),
  );
}

export async function PATCH(request: Request, { params }: P) {
  const { org: slug } = await params;
  return withOrg(slug, { manage: true }, async ({ org }) => {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 120) return json({ error: "A name of 1 to 120 characters is required" }, 400);
    const { error } = await adminClient().from("organizations").update({ name }).eq("id", org.id);
    if (error) return json({ error: "Could not rename" }, 500);
    return json({ id: org.id, slug: org.slug, name, plan: org.plan, role: org.role });
  });
}
