import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { refreshSession } from "@/lib/supabase/session";

// Signed-out visitors to /app and /profile go to /auth. Without Supabase configured, nothing is gated.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) {
    return response;
  }
  const { user } = await refreshSession(request, response);
  if (!user) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect as well.
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/profile"],
};
