import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnv, supabaseUrl } from "./config";

let client: SupabaseClient | null = null;

/**
 * Service-role client: bypasses row level security. Only server code calls it, and
 * only after checking the caller's membership and role.
 */
export function createAdminClient(): SupabaseClient {
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl() || !key) {
    throw new Error("Supabase service role is not configured.");
  }
  client ??= createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
