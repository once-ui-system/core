import { apiOrg, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await apiOrg(slug);
  if (ctx instanceof Response) return ctx;
  const { id, name, plan, role } = ctx.org;
  return json({ id, slug: ctx.org.slug, name, plan, role });
}
