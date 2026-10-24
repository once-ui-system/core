import { createAdminSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Membership, type Role, hasRole, DEMO_ORG } from "./types";
import { isSupabaseConfigured } from "@/lib/env";

export type Admin = SupabaseClient;

export type OrgCheck =
  | { ok: true; org: Membership; admin: Admin }
  | { ok: false; status: number; code: string; message: string };

/**
 * Loads an organization the user belongs to, with their role in it. Non-members
 * get the same 404 as a missing organization, so the response reveals nothing
 * about other tenants. Pass `minimum` to require a role (403 below it).
 * Every org-scoped route goes through this; the admin client filters by user id.
 */
export async function checkOrgAccess(
  slug: string,
  userId: string,
  minimum: Role = "member",
): Promise<OrgCheck> {
  const admin = createAdminSupabase();
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (orgError) return { ok: false, status: 500, code: "internal_error", message: "Failed to load the organization" };
  if (!org) return notFound();

  const { data: membership, error: memberError } = await admin
    .from("memberships")
    .select("role")
    .eq("organization_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (memberError) return { ok: false, status: 500, code: "internal_error", message: "Failed to load membership" };
  if (!membership) return notFound();

  const role = membership.role as Role;
  if (!hasRole(role, minimum)) {
    return { ok: false, status: 403, code: "forbidden", message: `${capitalize(minimum)} access required` };
  }
  return { ok: true, org: { ...org, role } as Membership, admin };
}

/** Like checkOrgAccess, but answers demo mode with the demo organization and no database. */
export async function checkOrgAccessOrDemo(
  slug: string,
  userId: string | null,
  minimum: Role = "member",
): Promise<OrgCheck> {
  if (!isSupabaseConfigured()) {
    if (slug !== DEMO_ORG.slug) return notFound();
    return { ok: true, org: DEMO_ORG, admin: null as unknown as Admin };
  }
  if (!userId) return { ok: false, status: 401, code: "unauthorized", message: "Unauthorized" };
  return checkOrgAccess(slug, userId, minimum);
}

function notFound(): OrgCheck {
  return { ok: false, status: 404, code: "not_found", message: "Organization not found" };
}

function capitalize(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
