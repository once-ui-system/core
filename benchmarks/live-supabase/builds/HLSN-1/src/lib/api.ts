import { NextResponse } from "next/server";

/** A JSON error body: { "error": code, "message": text }. */
export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

/**
 * Runs a route body and turns an unexpected throw into a 500 JSON answer.
 * The detail goes to the server log, never to the client.
 */
export async function guarded(
  route: string,
  body: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await body();
  } catch (error) {
    console.error(`${route} failed:`, error);
    return apiError(500, "server_error", "Something went wrong. Try again.");
  }
}

/** The JSON body of a request, or null when it is missing or not an object. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
