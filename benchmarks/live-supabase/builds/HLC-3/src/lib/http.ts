import { NextResponse } from "next/server";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

// Reads a JSON object body. Returns null when the body is missing or not an object.
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

// Maps the messages raised by the Postgres functions in supabase/migrations to HTTP status codes.
export function statusForRpcError(message: string): number {
  if (message.includes("not_authenticated")) return 401;
  if (message.includes("invitation_not_found")) return 404;
  if (message.includes("invitation_expired")) return 410;
  if (message.includes("email_mismatch")) return 403;
  if (message.includes("invalid_name")) return 400;
  return 500;
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
