import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSupabaseConfigured, serviceRoleKey } from "./env";
import { currentUser, getOrgForUser, type OrgWithRole } from "./orgs";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

type Ctx<P> = { params: Promise<P> };

/** Wraps a route: demo mode answers 503, a signed-out caller 401. */
export function withUser<P = Record<string, never>>(
  handler: (req: Request, user: User, ctx: Ctx<P>) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    if (!isSupabaseConfigured() || !serviceRoleKey()) {
      return fail(503, "Supabase is not configured");
    }
    try {
      const user = await currentUser(req);
      if (!user) return fail(401, "Not signed in");
      return await handler(req, user, ctx);
    } catch (e) {
      console.error(e);
      return fail(500, "Something went wrong");
    }
  };
}

/** The org as seen by this user, or a 404 response (also for other tenants' orgs). */
export async function orgFor(slug: string, user: User): Promise<OrgWithRole | Response> {
  const org = await getOrgForUser(slug, user.id);
  return org ?? fail(404, "Organization not found");
}
