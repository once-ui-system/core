import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "./env";
import { createServerSupabase } from "./supabase/server";

/** Every JSON error from the API has this shape. */
export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * The signed-in user for a route handler, or the error response to return.
 * Answers 503 when Supabase is not configured, 401 when signed out.
 */
export async function requireApiUser(): Promise<
  { ok: true; userId: string; email: string } | { ok: false; response: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, response: apiError(503, "not_configured", "Supabase is not configured. See .env.example.") };
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { ok: false, response: apiError(401, "unauthorized", "Unauthorized") };
  }
  return { ok: true, userId: data.user.id, email: data.user.email ?? "" };
}

/** Reads a JSON object body, or null when it is missing or malformed. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
