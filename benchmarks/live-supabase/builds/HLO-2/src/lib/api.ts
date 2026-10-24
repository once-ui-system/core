import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";
import { listMyOrganizations } from "./orgs/service";
import type { OrgSummary } from "./orgs/types";
import { createSessionClient } from "./supabase/server";

export type ApiSession = { sb: SupabaseClient; userId: string; email: string };

export function fail(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

// The signed-in caller for a JSON route, or the error response to send back.
export async function apiSession(): Promise<ApiSession | Response> {
  if (!isSupabaseConfigured()) return fail(503, "Supabase is not configured");
  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user || !user.email) return fail(401, "Sign in first");
  return { sb, userId: user.id, email: user.email };
}

// The organization with this slug, when the caller is a member; otherwise 404.
export async function apiOrg(session: ApiSession, slug: string): Promise<OrgSummary | Response> {
  const org = (await listMyOrganizations(session.sb)).find((o) => o.slug === slug);
  return org ?? fail(404, "Organization not found");
}

export function isError(value: unknown): value is Response {
  return value instanceof Response;
}

// Turns an unexpected throw into a 500 without leaking details.
export function guarded<C>(handler: (request: Request, context: C) => Promise<Response>) {
  return async (request: Request, context: C): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(error);
      return fail(500, "Something went wrong");
    }
  };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
