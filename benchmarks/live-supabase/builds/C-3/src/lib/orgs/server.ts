import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient, getUser } from "@/lib/sb/server";
import { canManage, type Plan, type Role } from "./types";

export type OrgInfo = { id: string; slug: string; name: string; plan: Plan; role: Role };

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new HttpError(401, "Not signed in");
  return user;
}

/** Orgs the user belongs to, oldest membership first. */
export async function listUserOrgs(userId: string): Promise<OrgInfo[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_members")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  const out: OrgInfo[] = [];
  for (const row of data ?? []) {
    const o = row.organizations as unknown as Omit<OrgInfo, "role"> | null;
    if (o) out.push({ ...o, role: row.role as Role });
  }
  return out;
}

/** The org by slug, if (and only if) the user is a member. */
export async function requireMembership(userId: string, slug: string): Promise<OrgInfo> {
  const admin = createAdminClient();
  const { data: org, error } = await admin
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!org) throw new HttpError(404, "Organization not found");
  const { data: m } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!m) throw new HttpError(404, "Organization not found");
  return { ...(org as Omit<OrgInfo, "role">), role: m.role as Role };
}

export async function requireManager(userId: string, slug: string): Promise<OrgInfo> {
  const org = await requireMembership(userId, slug);
  if (!canManage(org.role)) throw new HttpError(403, "Admins and owners only");
  return org;
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "org";
}

export async function createOrganization(userId: string, rawName: string): Promise<OrgInfo> {
  const name = (rawName ?? "").toString().trim();
  if (!name || name.length > 120) throw new HttpError(400, "Name is required");
  const admin = createAdminClient();
  const slug = `${slugify(name)}-${randomBytes(3).toString("hex")}`;
  const { data: org, error } = await admin
    .from("organizations")
    .insert({ name, slug, created_by: userId })
    .select("id, slug, name, plan")
    .single();
  if (error || !org) throw new HttpError(500, error?.message ?? "Could not create");
  const { error: e2 } = await admin
    .from("org_members")
    .insert({ org_id: org.id, user_id: userId, role: "owner" });
  if (e2) {
    await admin.from("organizations").delete().eq("id", org.id);
    throw new HttpError(500, e2.message);
  }
  return { ...(org as Omit<OrgInfo, "role">), role: "owner" };
}

export type MemberRow = { user_id: string; email: string; role: Role };

export async function listMembers(orgId: string): Promise<MemberRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_members")
    .select("user_id, role")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return Promise.all(
    (data ?? []).map(async (m) => {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      return { user_id: m.user_id, email: u.user?.email ?? "", role: m.role as Role };
    }),
  );
}

export async function createInvitation(
  userId: string,
  org: OrgInfo,
  role: string,
  email?: string,
) {
  if (role !== "member" && role !== "admin") throw new HttpError(400, "Invalid role");
  const admin = createAdminClient();
  const token = randomBytes(24).toString("base64url");
  const { error } = await admin.from("invitations").insert({
    token,
    org_id: org.id,
    email: email?.trim() || null,
    role,
    invited_by: userId,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  if (error) throw new HttpError(500, error.message);
  return token;
}

export async function acceptInvitation(user: { id: string; email?: string | null }, token: string) {
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("invitations")
    .select("token, org_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();
  if (!inv) throw new HttpError(404, "Invitation not found");
  if (new Date(inv.expires_at).getTime() < Date.now()) throw new HttpError(410, "Invitation expired");
  if (inv.email && user.email && inv.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new HttpError(403, "This invitation is for another email address");
  }
  const { data: existing } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", inv.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    const { error } = await admin
      .from("org_members")
      .insert({ org_id: inv.org_id, user_id: user.id, role: inv.role });
    if (error) throw new HttpError(500, error.message);
  }
  await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("token", token);
  const { data: org } = await admin
    .from("organizations")
    .select("slug")
    .eq("id", inv.org_id)
    .single();
  return { slug: org?.slug as string };
}

export async function renameOrganization(orgId: string, name: string) {
  const n = name.trim();
  if (!n || n.length > 120) throw new HttpError(400, "Name is required");
  const { error } = await createAdminClient().from("organizations").update({ name: n }).eq("id", orgId);
  if (error) throw new HttpError(500, error.message);
}

export async function countPendingInvitations(orgId: string) {
  const { count } = await createAdminClient()
    .from("invitations")
    .select("token", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}
