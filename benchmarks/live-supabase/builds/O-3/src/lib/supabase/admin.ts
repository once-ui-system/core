import { serviceRoleKey, supabaseUrl } from "../env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any> | null = null;

/** Service-role client. Server only; callers must check membership themselves. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function admin(): SupabaseClient<any> {
  if (!client) {
    const url = supabaseUrl();
    const key = serviceRoleKey();
    if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
