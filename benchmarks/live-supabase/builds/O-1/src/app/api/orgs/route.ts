import { fail, json, readJson } from "../../../lib/api";
import { createOrg, getSessionUser } from "../../../lib/orgs";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return fail(503, "Supabase is not configured");
  const user = await getSessionUser();
  if (!user) return fail(401, "Not signed in");
  const body = await readJson(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return fail(400, "A name of 1 to 120 characters is required");
  const org = await createOrg(user.id, name);
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
}
