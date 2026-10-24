import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Email links (confirmation, password reset) come back here with a one-time code.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  if (isSupabaseConfigured() && code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const failure = new URL("/auth", url.origin);
  failure.searchParams.set("error", "That link is invalid or has expired. Try again.");
  return NextResponse.redirect(failure);
}
