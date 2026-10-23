import "server-only";
import { NextResponse } from "next/server";
import { getOrgForUser, getSessionUser, type OrgWithRole } from "./orgs";
import { isSupabaseConfigured } from "./supabase/config";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

type Guard =
  | { res: NextResponse }
  | { user: { id: string; email: string }; org: OrgWithRole; res?: undefined };

/** 401 when signed out, 404 when the organization does not exist or the user is not a member. */
export async function requireOrg(slug: string): Promise<Guard> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { res: fail(503, "Supabase is not configured") };
  const user = await getSessionUser();
  if (!user) return { res: fail(401, "Not signed in") };
  const org = await getOrgForUser(slug, user.id);
  if (!org) return { res: fail(404, "Organization not found") };
  return { user, org };
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const v = await request.json();
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
