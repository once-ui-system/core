import "server-only";
import { randomBytes } from "node:crypto";
import { createAdmin, createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; slug: string; name: string; plan: "free" | "team" };
export type OrgContext = { org: Org; role: Role };
export type SessionUser = { id: string; email: string };

export const DEMO_USER: SessionUser = { id: "demo-user", email: "demo@acme-notes.example" };
export const DEMO_CTX: OrgContext = {
  org: { id: "demo-org", slug: "demo", name: "Acme Demo Team", plan: "free" },
  role: "owner",
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return DEMO_USER;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export const canManage = (role: Role) => role === "owner" || role === "admin";

const ORG_COLS = "id, slug, name, plan";

export async function listUserOrgs(userId: string): Promise<OrgContext[]> {
  if (!isSupabaseConfigured()) return [DEMO_CTX];
  const { data } = await createAdmin()
    .from("memberships")
    .select(`role, created_at, organizations(${ORG_COLS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? [])
    .map((r) => {
      const org = r.organizations as unknown as Org | null;
      return org ? { org, role: r.role as Role } : null;
    })
    .filter((x): x is OrgContext => x !== null);
}

/** The org and the user's role in it, or null when the org doesn't exist or the user isn't a member. */
export async function getOrgContext(slug: string, userId: string): Promise<OrgContext | null> {
  if (!isSupabaseConfigured()) return slug === DEMO_CTX.org.slug ? DEMO_CTX : null;
  const admin = createAdmin();
  const { data: org } = await admin.from("organizations").select(ORG_COLS).eq("slug", slug).maybeSingle();
  if (!org) return null;
  const { data: m } = await admin
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!m) return null;
  return { org: org as Org, role: m.role as Role };
}

function slugify(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${base || "org"}-${randomBytes(3).toString("hex")}`;
}

export async function createOrg(user: SessionUser, name: string): Promise<Org> {
  const admin = createAdmin();
  const { data: org, error } = await admin
    .from("organizations")
    .insert({ name, slug: slugify(name), created_by: user.id })
    .select(ORG_COLS)
    .single();
  if (error || !org) throw new Error(error?.message ?? "Could not create organization");
  const { error: mErr } = await admin
    .from("memberships")
    .insert({ org_id: org.id, user_id: user.id, email: user.email, role: "owner" });
  if (mErr) {
    await admin.from("organizations").delete().eq("id", org.id);
    throw new Error(mErr.message);
  }
  return org as Org;
}

export type Member = { user_id: string; email: string; role: Role };

export async function listMembers(orgId: string): Promise<Member[]> {
  if (!isSupabaseConfigured()) {
    return [
      { user_id: DEMO_USER.id, email: DEMO_USER.email, role: "owner" },
      { user_id: "demo-2", email: "sam@acme-notes.example", role: "admin" },
      { user_id: "demo-3", email: "alex@acme-notes.example", role: "member" },
    ];
  }
  const { data } = await createAdmin()
    .from("memberships")
    .select("user_id, email, role")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Member[];
}

export async function renameOrg(orgId: string, name: string) {
  const { error } = await createAdmin().from("organizations").update({ name }).eq("id", orgId);
  if (error) throw new Error(error.message);
}

export async function createInvitation(org: Org, inviter: SessionUser, role: "member" | "admin", email?: string | null) {
  const token = randomBytes(24).toString("base64url");
  const { error } = await createAdmin().from("invitations").insert({
    token,
    org_id: org.id,
    email: email || null,
    role,
    invited_by: inviter.id,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}

export type AcceptResult =
  | { ok: true; slug: string }
  | { ok: false; status: 403 | 404 | 410; error: string };

export async function acceptInvitation(token: string, user: SessionUser): Promise<AcceptResult> {
  const admin = createAdmin();
  const { data: inv } = await admin
    .from("invitations")
    .select("token, org_id, email, role, expires_at, accepted_at, organizations(slug)")
    .eq("token", token)
    .maybeSingle();
  if (!inv) return { ok: false, status: 404, error: "Invitation not found" };
  const slug = (inv.organizations as unknown as { slug: string } | null)?.slug ?? "";
  if (new Date(inv.expires_at).getTime() < Date.now()) return { ok: false, status: 410, error: "Invitation expired" };
  if (inv.email && inv.email.toLowerCase() !== user.email.toLowerCase())
    return { ok: false, status: 403, error: "This invitation was sent to a different email" };

  const { data: existing } = await admin
    .from("memberships").select("role").eq("org_id", inv.org_id).eq("user_id", user.id).maybeSingle();
  if (existing) return { ok: true, slug };
  if (inv.accepted_at) return { ok: false, status: 410, error: "Invitation already used" };

  // Claim the invitation atomically, then join.
  const { data: claimed } = await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString(), accepted_by: user.id })
    .eq("token", token)
    .is("accepted_at", null)
    .select("token");
  if (!claimed?.length) return { ok: false, status: 410, error: "Invitation already used" };
  const { error } = await admin
    .from("memberships")
    .insert({ org_id: inv.org_id, user_id: user.id, email: user.email, role: inv.role });
  if (error) return { ok: false, status: 404, error: error.message };
  return { ok: true, slug };
}

export async function dashboardStats(orgId: string) {
  if (!isSupabaseConfigured()) return { members: 3, notebooks: 12, notes: 148, pending: 2 };
  const admin = createAdmin();
  const [{ count: members }, { count: pending }] = await Promise.all([
    admin.from("memberships").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    admin.from("invitations").select("*", { count: "exact", head: true })
      .eq("org_id", orgId).is("accepted_at", null).gt("expires_at", new Date().toISOString()),
  ]);
  return { members: members ?? 0, notebooks: 0, notes: 0, pending: pending ?? 0 };
}
