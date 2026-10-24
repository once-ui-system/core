import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { safeNext } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Where email links land (confirmation and password reset). Exchanges the
 * one-time code for a session, which the server client stores in cookies,
 * then sends the visitor to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next") ?? undefined);

  if (code && isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
