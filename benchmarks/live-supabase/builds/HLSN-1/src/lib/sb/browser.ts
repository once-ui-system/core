import { createBrowserClient } from "@supabase/ssr";

/** Browser client for the sign-in forms. Call only when Supabase is configured. */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
