import { createClient } from "@supabase/supabase-js";
import { serviceRoleKey, supabaseEnv } from "@/lib/env";

// Service role client. Bypasses row level security, so only trusted server code (the Stripe webhook) uses it.
export function createAdminClient() {
  const key = serviceRoleKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  const { url } = supabaseEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
