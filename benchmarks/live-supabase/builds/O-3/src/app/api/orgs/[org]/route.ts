import { fail, json, orgFor, withUser } from "@/lib/api";
import { canManage } from "@/lib/orgs";
import { admin } from "@/lib/supabase/admin";

type P = { org: string };

export const GET = withUser<P>(async (_req, user, ctx) => {
  const org = await orgFor((await ctx.params).org, user);
  if (org instanceof Response) return org;
  return json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: org.role });
});

export const PATCH = withUser<P>(async (req, user, ctx) => {
  const org = await orgFor((await ctx.params).org, user);
  if (org instanceof Response) return org;
  if (!canManage(org.role)) return fail(403, "Only owners and admins can rename");
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return fail(400, "name is required (up to 80 characters)");
  const { error } = await admin().from("organizations").update({ name }).eq("id", org.id);
  if (error) return fail(500, "Could not rename");
  return json({ id: org.id, slug: org.slug, name, plan: org.plan, role: org.role });
});
