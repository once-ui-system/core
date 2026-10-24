import { randomBytes } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { createAdminClient } from "./supabase/admin";
import { isSupabaseConfigured } from "./supabase/config";

export type Role = "owner" | "admin" | "member";
export type Plan = "free" | "team";

export type Org = { id: string; slug: string; name: string; plan: Plan };
/** An organization as the caller sees it: with the caller's role. */
export type OrgAccess = Org & { role: Role };

export type MemberRow = { user_id: string; email: string; role: Role };

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const FREE_MEMBER_LIMIT = 3;

/** The one organization demo mode shows. */
export const DEMO_ORG: OrgAccess = {
  id: "demo",
  slug: "demo",
  name: "Demo workspace",
  plan: "free",
  role: "owner",
};

export const canManage = (role: Role) => role === "owner" || role === "admin";

export const roleLabel = (role: Role) => role.charAt(0).toUpperCase() + role.slice(1);

export function validOrgName(name: string): string | null {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 80 ? trimmed : null;
}

export function slugify(name: string): string {
  const base =
    name
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "org";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export type AccessResult =
  | { ok: true; access: OrgAccess }
  | { ok: false; status: 403 | 404 };

/**
 * Checks that the user belongs to the organization with this slug (and, with
 * `manage`, is an owner or admin). Every org-scoped route and action calls this.
 */
export async function checkOrgAccess(slug: string, userId: string, manage = false): Promise<AccessResult> {
  const db = createAdminClient();
  const { data: org, error } = await db
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!org) return { ok: false, status: 404 };

  const { data: membership, error: memberError } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!membership) return { ok: false, status: 403 };

  const role = membership.role as Role;
  if (manage && !canManage(role)) return { ok: false, status: 403 };
  return { ok: true, access: { ...(org as Org), role } };
}

/** Page guard: demo org in demo mode; otherwise sign in, then membership, else 404. */
export async function orgPageAccess(slug: string): Promise<{ user: { id: string; email?: string } | null; org: OrgAccess }> {
  if (!isSupabaseConfigured()) {
    if (slug !== DEMO_ORG.slug) notFound();
    return { user: null, org: DEMO_ORG };
  }
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/app/${slug}`)}`);
  const result = await checkOrgAccess(slug, user.id);
  if (!result.ok) notFound();
  return { user, org: result.access };
}

export async function listOrganizationsFor(userId: string): Promise<OrgAccess[]> {
  const { data, error } = await createAdminClient()
    .from("memberships")
    .select("role, created_at, organizations!inner(id, slug, name, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...(row.organizations as unknown as Org),
    role: row.role as Role,
  }));
}

export async function createOrganization(userId: string, name: string): Promise<Org> {
  const db = createAdminClient();
  const { data: org, error } = await db
    .from("organizations")
    .insert({ name, slug: slugify(name) })
    .select("id, slug, name, plan")
    .single();
  if (error) throw error;

  const { error: memberError } = await db
    .from("memberships")
    .insert({ org_id: org.id, user_id: userId, role: "owner" });
  if (memberError) {
    await db.from("organizations").delete().eq("id", org.id);
    throw memberError;
  }
  return org as Org;
}

export async function renameOrganization(orgId: string, name: string): Promise<void> {
  const { error } = await createAdminClient().from("organizations").update({ name }).eq("id", orgId);
  if (error) throw error;
}

export async function listMembers(org: OrgAccess): Promise<MemberRow[]> {
  if (!isSupabaseConfigured()) {
    return [{ user_id: "demo", email: "Demo mode: no account signed in", role: "owner" }];
  }
  const { data, error } = await createAdminClient().rpc("org_members", { p_org: org.id });
  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

export async function countPendingInvitations(orgId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { count, error } = await createAdminClient()
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gt("expires_at", new Date().toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function createInvitation(
  org: OrgAccess,
  createdBy: string,
  role: "admin" | "member",
  email: string | null,
): Promise<{ token: string; expiresAt: string }> {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  const { error } = await createAdminClient().from("invitations").insert({
    org_id: org.id,
    token,
    email,
    role,
    created_by: createdBy,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return { token, expiresAt };
}

export type InvitationView = {
  token: string;
  email: string | null;
  role: "admin" | "member";
  expires_at: string;
  org: Org;
};

export async function getInvitation(token: string): Promise<InvitationView | null> {
  const { data, error } = await createAdminClient()
    .from("invitations")
    .select("token, email, role, expires_at, organizations!inner(id, slug, name, plan)")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    token: data.token,
    email: data.email,
    role: data.role as "admin" | "member",
    expires_at: data.expires_at,
    org: data.organizations as unknown as Org,
  };
}

export type AcceptResult =
  | { ok: true; org: Org; role: Role }
  | { ok: false; status: 403 | 404 | 410; error: string };

/**
 * Joins the user to the invitation's organization with the invitation's role. A
 * user who is already a member keeps the role they have.
 */
export async function acceptInvitation(
  token: string,
  user: { id: string; email?: string },
): Promise<AcceptResult> {
  const invite = await getInvitation(token);
  if (!invite) return { ok: false, status: 404, error: "This invitation does not exist." };
  if (new Date(invite.expires_at).getTime() <= Date.now()) {
    return { ok: false, status: 410, error: "This invitation has expired." };
  }
  if (invite.email && invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return { ok: false, status: 403, error: "This invitation was sent to a different email address." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("memberships")
    .upsert(
      { org_id: invite.org.id, user_id: user.id, role: invite.role },
      { onConflict: "org_id,user_id", ignoreDuplicates: true },
    );
  if (error) throw error;

  const { data: membership, error: readError } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", invite.org.id)
    .eq("user_id", user.id)
    .single();
  if (readError) throw readError;
  return { ok: true, org: invite.org, role: membership.role as Role };
}
