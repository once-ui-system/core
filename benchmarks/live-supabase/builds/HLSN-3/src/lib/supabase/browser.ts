import { createBrowserClient } from "@supabase/ssr";

/** The browser client for sign-in forms and sign-out. Only call when Supabase is configured. */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
