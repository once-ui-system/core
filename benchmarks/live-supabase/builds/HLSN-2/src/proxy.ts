import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/sb/middleware";

/**
 * Every request but static assets: refresh the Supabase session and gate
 * `/app` and `/profile` behind sign-in (when Supabase is configured). The
 * session is refreshed in exactly this one place, so Supabase's single-use
 * refresh-token rotation is never lost to a second refresh.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
