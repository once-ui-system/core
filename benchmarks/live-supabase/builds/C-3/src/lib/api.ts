import "server-only";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { HttpError } from "@/lib/orgs/server";

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message || "Server error" }, { status: 500 });
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const v = await req.json();
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
