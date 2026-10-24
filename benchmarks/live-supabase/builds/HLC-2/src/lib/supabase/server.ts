import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/** Supabase client bound to the signed-in user's session cookie. RLS applies. */
export async function createSupabaseServerClient() {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS, so only use it after the caller has been
 * checked: today that is the Stripe webhook, which has no user session.
 */
export function createSupabaseAdminClient() {
  const url = env.supabaseUrl();
  const key = env.supabaseServiceRoleKey();
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
