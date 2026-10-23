import "server-only";
import { randomBytes } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { adminClient, currentUser } from "./supabase/server";

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; slug: string; name: string; plan: "free" | "team"; created_at: string };
export type OrgWithRole = Org & { role: Role };

export const canManage = (role: Role) => role === "owner" || role === "admin";

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}
export const unauthorized = () => json({ error: "Not signed in" }, 401);
export const notFound = () => json({ error: "Organization not found" }, 404);
export const forbidden = () => json({ error: "Not allowed" }, 403);

export async function userOrgs(userId: string): Promise<OrgWithRole[]> {
  const db = adminClient();
  const { data } = await db
    .from("memberships")
    .select("role, organizations(id, slug, name, plan, created_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  type Row = { role: Role; organizations: Org | Org[] | null };
  return ((data ?? []) as unknown as Row[]).flatMap((row) => {
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return org ? [{ ...org, role: row.role }] : [];
  });
}

export async function orgForUser(slug: string, userId: string): Promise<OrgWithRole | null> {
  const db = adminClient();
  const { data: org } = await db
    .from("organizations")
    .select("id, slug, name, plan, created_at")
    .eq("slug", slug)
    .maybeSingle();
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

type Ctx = { user: User; org: OrgWithRole };

/** Route guard: signed in, member of the organization, and (optionally) admin or owner. */
export async function withOrg(
  slug: string,
  opts: { manage?: boolean },
  fn: (ctx: Ctx) => Promise<Response>,
): Promise<Response> {
  const user = await currentUser();
  if (!user) return unauthorized();
  const org = await orgForUser(slug, user.id);
  if (!org) return notFound();
  if (opts.manage && !canManage(org.role)) return forbidden();
  return fn({ user, org });
}

export async function listMembers(orgId: string) {
  const db = adminClient();
  const { data } = await db
    .from("memberships")
    .select("user_id, email, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  return (data ?? []) as { user_id: string; email: string; role: Role; created_at: string }[];
}

export async function pendingInvitationCount(orgId: string) {
  const db = adminClient();
  const { count } = await db
    .from("invitations")
    .select("token", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}

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

export const newToken = () => randomBytes(24).toString("base64url");
