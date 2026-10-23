import { createServerClient } from "@supabase/ssr";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured, serviceRoleKey, supabaseConfig } from "../env";

/** Client bound to the visitor's session cookie. */
export async function sessionClient() {
  const { url, anonKey } = supabaseConfig();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: the proxy refreshes the cookies
        }
      },
    },
  });
}

/** Service-role client: bypasses RLS. Only used after the caller's membership is checked. */
export function adminClient() {
  const { url } = supabaseConfig();
  return createAdmin(url, serviceRoleKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function currentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
