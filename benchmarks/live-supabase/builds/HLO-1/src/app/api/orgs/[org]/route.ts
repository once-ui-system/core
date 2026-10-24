import { getCurrentUser } from "@/lib/auth";
import { apiError, json } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Context = { params: Promise<{ org: string }> };

export async function GET(_request: Request, { params }: Context) {
  if (!isSupabaseConfigured()) return apiError(503, "Supabase is not configured.");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in first.");

  const { org } = await params;
  const access = await checkOrgAccess(org, user.id);
  if (!access.ok) return apiError(access.status, access.status === 404 ? "Not found." : "Not a member of this organization.");

  const { id, slug, name, plan, role } = access.access;
  return json({ id, slug, name, plan, role });
}
