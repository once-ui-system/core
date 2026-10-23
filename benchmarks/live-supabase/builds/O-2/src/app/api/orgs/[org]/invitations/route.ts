import { adminClient } from "../../../../../lib/supabase/server";
import { json, newToken, withOrg } from "../../../../../lib/orgs";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  return withOrg(slug, { manage: true }, async ({ org, user }) => {
    const body = await request.json().catch(() => null);
    const role = body?.role;
    if (role !== "member" && role !== "admin") return json({ error: "role must be member or admin" }, 400);
    const email = typeof body?.email === "string" && body.email.trim() ? body.email.trim() : null;
    const token = newToken();
    const { error } = await adminClient()
      .from("invitations")
      .insert({
        token,
        org_id: org.id,
        email,
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      });
    if (error) return json({ error: "Could not create the invitation" }, 500);
    const origin = new URL(request.url).origin;
    return json({ token, url: `${origin}/invite/${token}` }, 201);
  });
}
