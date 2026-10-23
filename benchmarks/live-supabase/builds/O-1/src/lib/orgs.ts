import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient, createSessionClient } from "./supabase/server";

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; slug: string; name: string; plan: "free" | "team" };
export type OrgWithRole = Org & { role: Role };
export type Member = { user_id: string; email: string; role: Role };

export const canManage = (role: Role) => role === "owner" || role === "admin";

export function slugify(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "org";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export async function getSessionUser() {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}

const ORG_COLS = "id, slug, name, plan";

export async function listUserOrgs(userId: string): Promise<OrgWithRole[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("memberships")
    .select(`role, created_at, organizations (${ORG_COLS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as { role: Role; organizations: Org | Org[] | null }[];
  return rows.flatMap((r) => {
    const o = Array.isArray(r.organizations) ? r.organizations[0] : r.organizations;
    return o ? [{ ...o, role: r.role }] : [];
  });
}

/** The organization with this slug, only if the user is a member of it. */
export async function getOrgForUser(slug: string, userId: string): Promise<OrgWithRole | null> {
  const db = createAdminClient();
  const { data: org } = await db.from("organizations").select(ORG_COLS).eq("slug", slug).maybeSingle();
  if (!org) return null;
  const { data: m } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!m) return null;
  return { ...(org as Org), role: m.role as Role };
}

export async function listMembers(orgId: string): Promise<Member[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return Promise.all(
    (data ?? []).map(async (m) => {
      const { data: u } = await db.auth.admin.getUserById(m.user_id);
      return { user_id: m.user_id, email: u.user?.email ?? "", role: m.role as Role };
    }),
  );
}

export async function createOrg(userId: string, name: string): Promise<Org> {
  const db = createAdminClient();
  const { data: org, error } = await db
    .from("organizations")
    .insert({ name, slug: slugify(name), created_by: userId })
    .select(ORG_COLS)
    .single();
  if (error || !org) throw new Error(error?.message ?? "Could not create the organization");
  const { error: mErr } = await db.from("memberships").insert({ org_id: org.id, user_id: userId, role: "owner" });
  if (mErr) {
    await db.from("organizations").delete().eq("id", org.id);
    throw new Error(mErr.message);
  }
  return org as Org;
}

export async function renameOrg(orgId: string, name: string) {
  const db = createAdminClient();
  const { error } = await db.from("organizations").update({ name }).eq("id", orgId);
  if (error) throw new Error(error.message);
}

export async function createInvitation(org: Org, invitedBy: string, role: "admin" | "member", email?: string) {
  const db = createAdminClient();
  const token = randomBytes(24).toString("base64url");
  const { error } = await db.from("invitations").insert({
    token,
    org_id: org.id,
    role,
    email: email || null,
    invited_by: invitedBy,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}

export type AcceptResult =
  | { ok: true; org: Org; role: Role }
  | { ok: false; reason: "not_found" | "expired" };

export async function acceptInvitation(token: string, userId: string): Promise<AcceptResult> {
  const db = createAdminClient();
  const { data: inv } = await db
    .from("invitations")
    .select(`token, role, expires_at, org_id, organizations (${ORG_COLS})`)
    .eq("token", token)
    .maybeSingle();
  if (!inv) return { ok: false, reason: "not_found" };
  if (new Date(inv.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };
  const raw = inv.organizations as unknown as Org | Org[] | null;
  const org = Array.isArray(raw) ? raw[0] : raw;
  if (!org) return { ok: false, reason: "not_found" };

  const { data: existing } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return { ok: true, org, role: existing.role as Role };

  const { error } = await db.from("memberships").insert({ org_id: org.id, user_id: userId, role: inv.role });
  if (error) throw new Error(error.message);
  return { ok: true, org, role: inv.role as Role };
}

export function siteOrigin(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}
