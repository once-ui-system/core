import { redirect, notFound } from "next/navigation";
import type { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { createSupabaseServerClient } from "@/lib/sb/server";
import { apiError } from "@/lib/api";
import { canManage, type Role } from "./roles";
import { DEMO_MEMBERS, DEMO_ORG, DEMO_PENDING_INVITATIONS } from "./demo";
import {
  countPendingInvitations,
  findOrgBySlug,
  listMembers,
  membershipRole,
} from "./data";
import type { MemberRow, OrgRow } from "./types";

/** The signed-in user, or null. Always null in demo mode. */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export type ApiAccess =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; org: OrgRow; role: Role }
  | { ok: false; response: NextResponse };

/**
 * Checks an API request against one organization. `member` needs any
 * membership; `manage` needs an owner or admin. Answers 503 without
 * Supabase, 401 when signed out, 404 for an unknown slug, 403 for a
 * non-member or a member asking for `manage`.
 */
export async function apiAccess(slug: string, need: "member" | "manage"): Promise<ApiAccess> {
  if (!isSupabaseConfigured()) {
    return { ok: false, response: apiError(503, "not_configured", "Supabase is not configured.") };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, response: apiError(401, "unauthorized", "Sign in first.") };

  const org = await findOrgBySlug(slug);
  if (!org) return { ok: false, response: apiError(404, "not_found", "Organization not found.") };

  const role = await membershipRole(org.id, user.id);
  if (!role) return { ok: false, response: apiError(403, "not_a_member", "You are not a member of this organization.") };

  if (need === "manage" && !canManage(role)) {
    return { ok: false, response: apiError(403, "insufficient_role", "Only owners and admins can do this.") };
  }

  return { ok: true, user, org, role };
}

export type OrgPage = {
  demo: boolean;
  org: OrgRow;
  role: Role;
  members: MemberRow[];
  pendingInvitations: number;
};

/**
 * Resolves an organization for a server-rendered page. Signed-out visitors
 * go to sign-in; non-members and unknown slugs get the 404 page. Demo mode
 * serves the sample organization under its own slug only.
 */
export async function loadOrgPage(slug: string): Promise<OrgPage> {
  if (!isSupabaseConfigured()) {
    if (slug !== DEMO_ORG.slug) notFound();
    return {
      demo: true,
      org: DEMO_ORG,
      role: "owner",
      members: DEMO_MEMBERS,
      pendingInvitations: DEMO_PENDING_INVITATIONS,
    };
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/app/${slug}`)}`);

  const org = await findOrgBySlug(slug);
  if (!org) notFound();

  const role = await membershipRole(org.id, user.id);
  if (!role) notFound();

  const [members, pendingInvitations] = await Promise.all([
    listMembers(org.id),
    countPendingInvitations(org.id),
  ]);

  return { demo: false, org, role, members, pendingInvitations };
}
