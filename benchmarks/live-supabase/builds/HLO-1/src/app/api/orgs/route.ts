import { getCurrentUser } from "@/lib/auth";
import { apiError, json, readJson } from "@/lib/api";
import { createOrganization, validOrgName } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return apiError(503, "Supabase is not configured.");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in first.");

  const body = await readJson(request);
  const name = typeof body?.name === "string" ? validOrgName(body.name) : null;
  if (!name) return apiError(400, "name is required (1 to 80 characters).");

  const org = await createOrganization(user.id, name);
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
}
