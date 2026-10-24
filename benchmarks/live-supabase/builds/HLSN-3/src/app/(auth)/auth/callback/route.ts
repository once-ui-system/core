import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/redirect";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * The link in a confirmation or password-reset email. Exchanges the one-time
 * code for a session, then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");

  if (code && isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  const failed = new URL("/auth", origin);
  failed.searchParams.set("error", "The link is invalid or has expired. Request a new one.");
  return NextResponse.redirect(failed);
}
