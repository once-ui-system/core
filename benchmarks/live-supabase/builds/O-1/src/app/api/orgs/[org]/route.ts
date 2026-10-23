import { fail, json, readJson, requireOrg } from "../../../../lib/api";
import { canManage, renameOrg } from "../../../../lib/orgs";

type Ctx = { params: Promise<{ org: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireOrg((await params).org);
  if (g.res) return g.res;
  const { id, slug, name, plan, role } = g.org;
  return json({ id, slug, name, plan, role });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const g = await requireOrg((await params).org);
  if (g.res) return g.res;
  if (!canManage(g.org.role)) return fail(403, "Only owners and admins can rename the organization");
  const body = await readJson(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return fail(400, "A name of 1 to 120 characters is required");
  await renameOrg(g.org.id, name);
  return json({ id: g.org.id, slug: g.org.slug, name, plan: g.org.plan, role: g.org.role });
}
