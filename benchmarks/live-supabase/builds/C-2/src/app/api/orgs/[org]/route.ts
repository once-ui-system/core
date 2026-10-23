import { authorize, json, readJson } from "@/lib/api";
import { canManage, renameOrg } from "@/lib/orgs";

type Ctx = { params: Promise<{ org: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const a = await authorize((await params).org);
  if (a instanceof Response) return a;
  const { org, role } = a.ctx!;
  return json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const a = await authorize((await params).org);
  if (a instanceof Response) return a;
  const { org, role } = a.ctx!;
  if (!canManage(role)) return json({ error: "Forbidden" }, 403);
  const body = await readJson(req);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return json({ error: "A name of 1 to 120 characters is required" }, 400);
  await renameOrg(org.id, name);
  return json({ id: org.id, slug: org.slug, name, plan: org.plan, role });
}
