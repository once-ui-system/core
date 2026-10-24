import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getMyOrg } from "@/lib/orgs/context";
import type { OrgWithRole } from "@/lib/orgs/types";

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function notConfigured() {
  return json({ error: "Supabase is not configured" }, 503);
}

// Caller's Supabase session. Returns 401 when signed out.
export async function apiSession(): Promise<
  { supabase: SupabaseClient; userId: string } | NextResponse
> {
  if (!isSupabaseConfigured()) return notConfigured();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return json({ error: "Unauthorized" }, 401);
  return { supabase, userId: data.user.id };
}

// Session plus membership of {org}. 404 for an organization the caller cannot see (not a member).
export async function apiOrg(slug: string): Promise<
  { supabase: SupabaseClient; userId: string; org: OrgWithRole } | NextResponse
> {
  const session = await apiSession();
  if (session instanceof NextResponse) return session;
  const org = await getMyOrg(slug);
  if (!org) return json({ error: "Not found" }, 404);
  return { ...session, org };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
