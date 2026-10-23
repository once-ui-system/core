import { adminClient, currentUser } from "../../../../lib/supabase/server";
import { json, unauthorized } from "../../../../lib/orgs";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const { token } = await params;
  const db = adminClient();
  const { data: inv } = await db
    .from("invitations")
    .select("token, org_id, role, expires_at, organizations(slug, name)")
    .eq("token", token)
    .maybeSingle();
  if (!inv) return json({ error: "Invitation not found" }, 404);
  if (new Date(inv.expires_at).getTime() < Date.now()) return json({ error: "Invitation expired" }, 410);

  const { data: existing } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", inv.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    const { error } = await db
      .from("memberships")
      .insert({ org_id: inv.org_id, user_id: user.id, email: user.email ?? "", role: inv.role });
    if (error) return json({ error: "Could not join" }, 500);
  }
  const o = inv.organizations as unknown as { slug: string; name: string } | { slug: string; name: string }[] | null;
  const org = Array.isArray(o) ? o[0] : o;
  return json({ org: org?.slug, name: org?.name, role: existing?.role ?? inv.role });
}
