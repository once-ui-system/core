import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "./lib/env";

// Refreshes the Supabase session cookie on each request and keeps signed-out
// visitors out of /app. With no Supabase variables set, nothing is gated.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const gated = path === "/app" || path.startsWith("/app/") || path === "/auth/update-password";
  if (!user && gated) {
    const to = new URL("/auth", request.url);
    to.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: [
    // The Stripe webhook authenticates with its signature, not a session.
    "/((?!_next/static|_next/image|api/webhooks/|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
