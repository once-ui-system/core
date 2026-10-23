import type { NextRequest } from "next/server";
import { authProxy } from "@/lib/sb/proxy";

/**
 * Every request but static assets, through each slice's step in turn: the
 * i18n slice maps a language URL (`/hu/store`) onto the page it renders, then
 * the auth slice rate-limits and refreshes the Supabase session for that
 * page. A composition without one of them has its step unwired here.
 */
export async function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  // Everything that can touch auth — API routes included — but not static
  // assets. Refreshing the session in exactly one layer (here) keeps
  // Supabase's single-use refresh-token rotation from being lost.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|trademarks|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
