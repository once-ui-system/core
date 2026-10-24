import { getCurrentUser } from "@/lib/auth";
import { apiError, json } from "@/lib/api";
import { acceptInvitation } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Context = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Context) {
  if (!isSupabaseConfigured()) return apiError(503, "Supabase is not configured.");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in first.");

  const { token } = await params;
  const result = await acceptInvitation(token, user);
  if (!result.ok) return apiError(result.status, result.error);

  return json({ id: result.org.id, slug: result.org.slug, name: result.org.name, role: result.role });
}
