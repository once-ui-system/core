import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Completes email links: confirmation, password reset and magic links.
// Accepts either a PKCE `code` or a `token_hash` with `type`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next");
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(`/auth?mode=sign-in&error=${encodeURIComponent(message)}`, origin)
    );

  if (!isSupabaseConfigured()) return fail("Supabase is not configured");

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let error: { message: string } | null = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    return fail("This link is missing its code");
  }
  if (error) return fail(error.message);

  return NextResponse.redirect(new URL(destination, origin));
}
