import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for the database. It bypasses row level security, so
 * only server code uses it, and every query filters on the organization the
 * caller was checked to belong to (see lib/orgs/guard.ts).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
