import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { isSafeNext } from "@/lib/orgs/types";

// Email links (confirmation, password reset) land here and become a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = isSafeNext(searchParams.get("next")) ? searchParams.get("next")! : "/app";
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/auth", origin));
  }
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/auth?error=link", origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
