import { NextResponse } from "next/server";
import { requireUser } from "@/lib/orgs";
import { createAdminSupabase } from "@/lib/supabase/server";

export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const u = await requireUser();
  if (!u.ok) return u.response;
  const { token } = await ctx.params;
  const db = createAdminSupabase();
  const { data: inv } = await db
    .from("invitations")
    .select("id, org_id, role, expires_at, accepted_at, organizations(slug)")
    .eq("token", token)
    .maybeSingle();
  if (!inv) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  const slug = (inv.organizations as unknown as { slug: string } | null)?.slug;

  const { data: existing } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", inv.org_id)
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ org: slug, role: existing.role });

  if (inv.accepted_at) return NextResponse.json({ error: "Invitation already used" }, { status: 410 });
  if (new Date(inv.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }
  // claim the invitation atomically so a token is used once
  const { data: claimed } = await db
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", inv.id)
    .is("accepted_at", null)
    .select("id");
  if (!claimed?.length) return NextResponse.json({ error: "Invitation already used" }, { status: 410 });

  const { error } = await db.from("org_members").insert({
    org_id: inv.org_id,
    user_id: u.user.id,
    email: u.user.email,
    role: inv.role,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ org: slug, role: inv.role });
}
