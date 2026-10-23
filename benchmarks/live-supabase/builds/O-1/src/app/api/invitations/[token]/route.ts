import { fail, json } from "../../../../lib/api";
import { acceptInvitation, getSessionUser } from "../../../../lib/orgs";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return fail(503, "Supabase is not configured");
  const user = await getSessionUser();
  if (!user) return fail(401, "Not signed in");
  const r = await acceptInvitation((await params).token, user.id);
  if (!r.ok) return fail(r.reason === "expired" ? 410 : 404, r.reason === "expired" ? "Invitation expired" : "Invitation not found");
  return json({ id: r.org.id, slug: r.org.slug, name: r.org.name, role: r.role });
}
