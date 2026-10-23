import { randomBytes } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { admin } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { Role } from "./demo";

export type { Role };

export type Org = { id: string; slug: string; name: string; plan: "free" | "team" };
export type OrgWithRole = Org & { role: Role };
export type Member = { user_id: string; email: string; role: Role };

export const canManage = (role: Role) => role === "owner" || role === "admin";

const ORG_COLUMNS = "id, slug, name, plan";

/** The signed-in user: from a bearer token when given, else the session cookie. */
export async function currentUser(request?: Request): Promise<User | null> {
  const auth = request?.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const { data } = await admin().auth.getUser(auth.slice(7).trim());
    return data.user ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function listOrgs(userId: string): Promise<OrgWithRole[]> {
  const { data } = await admin()
    .from("memberships")
    .select(`role, created_at, organizations (${ORG_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as unknown as { role: Role; organizations: Org | null }[];
  return rows.filter((r) => r.organizations).map((r) => ({ ...r.organizations!, role: r.role }));
}

/** The org with this slug, and the user's role in it, or null if not a member. */
export async function getOrgForUser(slug: string, userId: string): Promise<OrgWithRole | null> {
  const { data: org } = await admin()
    .from("organizations")
    .select(ORG_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (!org) return null;
  const o = org as unknown as Org;
  const { data: m } = await admin()
    .from("memberships")
    .select("role")
    .eq("org_id", o.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!m) return null;
  return { ...o, role: (m as unknown as { role: Role }).role };
}

export async function listMembers(orgId: string): Promise<Member[]> {
  const { data } = await admin()
    .from("memberships")
    .select("user_id, email, role")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as Member[];
}

export async function countPendingInvitations(orgId: string): Promise<number> {
  const { count } = await admin()
    .from("invitations")
    .select("token", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";

export async function createOrg(user: User, name: string): Promise<Org> {
  const db = admin();
  const slug = `${slugify(name)}-${randomBytes(3).toString("hex")}`;
  const { data, error } = await db
    .from("organizations")
    .insert({ slug, name, created_by: user.id })
    .select(ORG_COLUMNS)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create organization");
  const org = data as unknown as Org;
  const { error: mErr } = await db
    .from("memberships")
    .insert({ org_id: org.id, user_id: user.id, email: user.email ?? "", role: "owner" });
  if (mErr) {
    await db.from("organizations").delete().eq("id", org.id);
    throw new Error(mErr.message);
  }
  return org;
}

export async function createInvitation(
  orgId: string,
  userId: string,
  role: "member" | "admin",
  email?: string,
) {
  const token = randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const { error } = await admin()
    .from("invitations")
    .insert({ token, org_id: orgId, email: email || null, role, invited_by: userId, expires_at: expires });
  if (error) throw new Error(error.message);
  return { token, expires_at: expires };
}

export type InviteLookup =
  | { status: "ok"; org: Org; role: "member" | "admin"; email: string | null }
  | { status: "missing" | "expired" | "used" };

export async function lookupInvitation(token: string): Promise<InviteLookup> {
  const { data } = await admin()
    .from("invitations")
    .select(`role, email, expires_at, accepted_at, organizations (${ORG_COLUMNS})`)
    .eq("token", token)
    .maybeSingle();
  const inv = data as unknown as {
    role: "member" | "admin";
    email: string | null;
    expires_at: string;
    accepted_at: string | null;
    organizations: Org | null;
  } | null;
  if (!inv || !inv.organizations) return { status: "missing" };
  if (new Date(inv.expires_at).getTime() < Date.now()) return { status: "expired" };
  if (inv.accepted_at) return { status: "used" };
  return { status: "ok", org: inv.organizations, role: inv.role, email: inv.email };
}

export async function acceptInvitation(token: string, user: User) {
  const db = admin();
  const { data } = await db
    .from("invitations")
    .select("org_id, role, expires_at, accepted_at, accepted_by")
    .eq("token", token)
    .maybeSingle();
  const inv = data as unknown as {
    org_id: string;
    role: "member" | "admin";
    expires_at: string;
    accepted_at: string | null;
    accepted_by: string | null;
  } | null;
  if (!inv) return { status: 404 as const };
  if (new Date(inv.expires_at).getTime() < Date.now()) return { status: 410 as const };
  if (inv.accepted_at && inv.accepted_by !== user.id) return { status: 410 as const };

  const { data: existing } = await db
    .from("memberships")
    .select("role")
    .eq("org_id", inv.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    const { error } = await db
      .from("memberships")
      .insert({ org_id: inv.org_id, user_id: user.id, email: user.email ?? "", role: inv.role });
    if (error) return { status: 500 as const };
  }
  if (!inv.accepted_at) {
    await db
      .from("invitations")
      .update({ accepted_at: new Date().toISOString(), accepted_by: user.id })
      .eq("token", token)
      .is("accepted_at", null);
  }
  const { data: org } = await db.from("organizations").select(ORG_COLUMNS).eq("id", inv.org_id).single();
  return { status: 200 as const, org: org as unknown as Org };
}
