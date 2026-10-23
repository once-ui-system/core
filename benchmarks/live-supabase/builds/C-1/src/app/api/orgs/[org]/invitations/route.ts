import { NextResponse } from "next/server";
import { newToken, requireOrg } from "@/lib/orgs";
import { createAdminSupabase } from "@/lib/supabase/server";

export async function POST(req: Request, ctx: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await ctx.params).org, { manage: true });
  if (!g.ok) return g.response;
  const body = await req.json().catch(() => null);
  const role = body?.role;
  if (role !== "member" && role !== "admin") {
    return NextResponse.json({ error: "role must be member or admin" }, { status: 400 });
  }
  const email = typeof body?.email === "string" && body.email.trim() ? body.email.trim() : null;
  const token = newToken();
  const { error } = await createAdminSupabase()
    .from("invitations")
    .insert({
      org_id: g.org.id,
      token,
      email,
      role,
      invited_by: g.user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  return NextResponse.json({ token, url: `${origin}/invite/${token}` }, { status: 201 });
}
