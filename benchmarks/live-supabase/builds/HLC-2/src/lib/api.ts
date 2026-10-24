import "server-only";
import { getViewer, type Viewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { OrgError } from "@/lib/orgs/actions";
import { StripeError } from "@/lib/stripe/checkout";

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof OrgError || error instanceof StripeError) {
    return json({ error: error.message }, error.status);
  }
  console.error(error);
  return json({ error: "internal error" }, 500);
}

/** Answers 503 in demo mode, 401 when signed out; otherwise returns the viewer. */
export async function requireApiViewer(): Promise<Viewer | Response> {
  if (!isSupabaseConfigured()) return json({ error: "Supabase is not configured" }, 503);
  const viewer = await getViewer();
  if (!viewer) return json({ error: "not signed in" }, 401);
  return viewer;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
