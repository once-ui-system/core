import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

/** Paths that need a signed-in user when Supabase is configured. */
const PROTECTED = ["/app", "/profile", "/invite", "/auth/update-password"];

/**
 * Refreshes the Supabase session cookie and sends signed-out visitors of the
 * protected paths to /auth, with the path they wanted in `next`. Demo mode
 * (no Supabase configured) passes everything through.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Do not run code between createServerClient and getUser(): a refresh that is
  // not written back to the response logs the user out at random.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const protectedPath = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!user && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/profile", "/invite/:path*", "/auth/update-password"],
};
