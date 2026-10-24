import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG, DEMO_USER } from "./demo";
import { canManage, type Org, type Role } from "./types";

export type SessionUser = { id: string; email: string };
export type Membership = { org: Org; role: Role };

// The signed-in user, or null. Demo mode has a fixed sample user.
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return DEMO_USER;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? "" } : null;
}

// Organizations the signed-in user belongs to, oldest membership first.
export async function listMyOrgs(): Promise<Membership[]> {
  if (!isSupabaseConfigured()) return [{ org: DEMO_ORG, role: "owner" }];
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const org = row.organizations as unknown as Org | null;
    return org ? [{ org, role: row.role as Role }] : [];
  });
}

// Looks up an organization and the caller's membership in it. Null when the
// organization does not exist or the caller is not a member.
export async function findMembership(
  supabase: SupabaseClient,
  slug: string,
  userId: string
): Promise<Membership | null> {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (orgError) throw orgError;
  if (!org) return null;

  const { data: membership, error: memberError } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!membership) return null;

  return { org: org as Org, role: membership.role as Role };
}

// For pages: the organization and the caller's role, or null (rendered as 404).
export async function getOrgPageContext(
  slug: string
): Promise<(Membership & { user: SessionUser }) | null> {
  if (!isSupabaseConfigured()) {
    return slug === DEMO_ORG.slug
      ? { user: DEMO_USER, org: DEMO_ORG, role: "owner" }
      : null;
  }
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const membership = await findMembership(supabase, slug, user.id);
  return membership ? { ...membership, user } : null;
}

export type ApiGuard =
  | { ok: true; supabase: SupabaseClient; user: SessionUser; org: Org; role: Role }
  | { ok: false; response: NextResponse };

function fail(status: number, error: string): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

// For JSON routes. 503 without Supabase, 401 when signed out, 404 when the
// organization is unknown or the caller is not a member, 403 when `manage` is
// set and the caller is a plain member.
export async function apiGuard(slug: string, options: { manage?: boolean } = {}): Promise<ApiGuard> {
  if (!isSupabaseConfigured()) return fail(503, "Supabase is not configured");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "Not signed in");

  const membership = await findMembership(supabase, slug, user.id);
  if (!membership) return fail(404, "Organization not found");
  if (options.manage && !canManage(membership.role)) {
    return fail(403, "Owners and admins only");
  }
  return {
    ok: true,
    supabase,
    user: { id: user.id, email: user.email ?? "" },
    org: membership.org,
    role: membership.role,
  };
}
