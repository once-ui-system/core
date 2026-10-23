import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Supabase client bound to the visitor's session cookie. */
export async function createSessionClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          try {
            for (const c of list) store.set(c.name, c.value, c.options);
          } catch {
            // Called from a Server Component: the proxy refreshes the session.
          }
        },
      },
    },
  );
}

/** Service role client. Only used after the caller's access was checked. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function getUser() {
  const sb = await createSessionClient();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
