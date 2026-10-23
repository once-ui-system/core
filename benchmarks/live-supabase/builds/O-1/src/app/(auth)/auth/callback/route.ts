import { NextResponse } from "next/server";
import { createSessionClient } from "../../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

// Email links (confirm sign-up, reset password) land here with a one-time code.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/app";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const code = url.searchParams.get("code");
  if (isSupabaseConfigured() && code) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safe, url.origin));
  }
  return NextResponse.redirect(new URL("/auth", url.origin));
}
