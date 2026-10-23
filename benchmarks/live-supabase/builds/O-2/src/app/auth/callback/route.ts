import { NextResponse } from "next/server";
import { sessionClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  if (code && isSupabaseConfigured()) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/auth?error=link", url.origin));
  }
  return NextResponse.redirect(new URL(safe, url.origin));
}
