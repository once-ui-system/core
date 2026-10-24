import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { sessionFromRequest } from "@/lib/sb/session";

/**
 * Gates the signed-in app: everything under /app and /profile redirects to
 * /auth when there is no session. It also refreshes the session cookies for
 * the auth pages, so the refresh-token rotation happens in one place. With no
 * Supabase configured (demo mode) nothing is gated.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  const { user, response } = await sessionFromRequest(request);
  const { pathname } = request.nextUrl;
  const signedInOnly = pathname === "/app" || pathname.startsWith("/app/") || pathname === "/profile";

  if (signedInOnly && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/profile", "/auth", "/auth/:path*", "/invite/:path*"],
};
