import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey } from "./config";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/sb/config";

/**
 * Routes that require a signed-in user when Supabase is configured. The
 * marketing pages, blog, and legal pages stay public; only the product shell
 * and the profile are gated. In demo mode (no Supabase env) nothing is gated.
 *
 * `/app` covers every org-scoped route in one prefix — which is part of what
 * giving tenancy a segment of its own buys. Note what it does NOT do: it
 * answers "is there a session", never "does this session belong in this
 * organization". That second question needs the database, and is answered by
 * requireOrg() in the `[org]` layout and in every org-scoped API route.
 */
const PROTECTED_PREFIXES = [
  "/app",
  "/profile",
];

/**
 * The page a request renders and the response that lets it through. Without
 * language URLs that is the request's own path and `NextResponse.next()`; the
 * i18n slice's proxy passes `/store` for `/hu/store` and a rewrite.
 */
export type ProxyRoute = { pathname: string; pass: () => NextResponse };

export async function updateSession(
  request: NextRequest,
  route: ProxyRoute = { pathname: request.nextUrl.pathname, pass: () => NextResponse.next({ request }) },
) {
  let supabaseResponse = route.pass();

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey()!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = route.pass();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = route;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    // Come back here after signing in (read by the auth forms via safeNextPath).
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
