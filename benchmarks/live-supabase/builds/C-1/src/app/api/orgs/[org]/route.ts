import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/orgs";
import { createAdminSupabase } from "@/lib/supabase/server";

export async function GET(_req: Request, ctx: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await ctx.params).org);
  if (!g.ok) return g.response;
  const { id, slug, name, plan, role } = g.org;
  return NextResponse.json({ id, slug, name, plan, role });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await ctx.params).org, { manage: true });
  if (!g.ok) return g.response;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const { error } = await createAdminSupabase()
    .from("organizations")
    .update({ name })
    .eq("id", g.org.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: g.org.id, slug: g.org.slug, name });
}
