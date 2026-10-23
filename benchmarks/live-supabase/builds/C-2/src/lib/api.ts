import "server-only";
import { NextResponse } from "next/server";
import { getOrgContext, getSessionUser, type OrgContext, type SessionUser } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/env";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

type Ok = { user: SessionUser; ctx?: OrgContext };

/** Authenticates the request (401) and, with a slug, checks membership (404 for non-members). */
export async function authorize(slug?: string): Promise<Ok | NextResponse> {
  if (!isSupabaseConfigured()) return json({ error: "Supabase is not configured" }, 503);
  const user = await getSessionUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (slug === undefined) return { user };
  const ctx = await getOrgContext(slug, user.id);
  if (!ctx) return json({ error: "Organization not found" }, 404);
  return { user, ctx };
}

export function originOf(req: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "http"}://${host}`;
  return new URL(req.url).origin;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const v = await req.json();
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
