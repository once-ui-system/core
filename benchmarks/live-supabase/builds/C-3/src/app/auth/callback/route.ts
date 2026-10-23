import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { createSessionClient } from "@/lib/sb/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  if (code && isSupabaseConfigured()) {
    const sb = await createSessionClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safe, url.origin));
  }
  return NextResponse.redirect(new URL("/auth", url.origin));
}
