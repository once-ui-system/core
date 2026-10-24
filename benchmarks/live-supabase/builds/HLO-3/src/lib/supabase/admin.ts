import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

// Service role client: bypasses row level security. Server only; used by the
// Stripe webhook, which has no user session.
export function createSupabaseAdminClient() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
