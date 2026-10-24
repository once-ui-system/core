import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { requestOrigin, safeNextPath } from "@/lib/http";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Confirmation and password-reset emails end here with ?code=. The code becomes
// a session cookie, then the visitor goes to ?next= (same-site paths only).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = requestOrigin(request.headers);
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  if (isSupabaseConfigured() && code) {
    const sb = await createSessionClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/auth?error=link", origin));
}
