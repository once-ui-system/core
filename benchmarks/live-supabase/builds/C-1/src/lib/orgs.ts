import "server-only";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; slug: string; name: string; plan: "free" | "team" };
export type SessionUser = { id: string; email: string };

export const DEMO_ORG: Org & { role: Role } = {
  id: "00000000-0000-0000-0000-000000000000",
  slug: "demo",
  name: "Demo Team",
  plan: "free",
  role: "owner",
};

export const DEMO_USER: SessionUser = { id: "demo-user", email: "demo@acme-notes.example" };

export const DEMO_MEMBERS = [
  { user_id: "demo-user", email: "demo@acme-notes.example", role: "owner" as Role },
  { user_id: "demo-2", email: "sam@acme-notes.example", role: "admin" as Role },
  { user_id: "demo-3", email: "riley@acme-notes.example", role: "member" as Role },
];

export function canManage(role: Role) {
  return role === "owner" || role === "admin";
}

export async function getUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return DEMO_USER;
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function listUserOrgs(userId: string): Promise<(Org & { role: Role })[]> {
  if (!isSupabaseConfigured()) return [DEMO_ORG];
  const db = createAdminSupabase();
  const { data } = await db
    .from("org_members")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).flatMap((r) => {
    const o = r.organizations as unknown as Org | null;
    return o ? [{ ...o, role: r.role as Role }] : [];
  });
}

export async function getMembership(
  userId: string,
  slug: string,
): Promise<(Org & { role: Role }) | null> {
  if (!isSupabaseConfigured()) return slug === DEMO_ORG.slug ? DEMO_ORG : null;
  const db = createAdminSupabase();
  const { data: org } = await db
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (!org) return null;
  const { data: m } = await db
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!m) return null;
  return { ...(org as Org), role: m.role as Role };
}

export async function listMembers(orgId: string) {
  if (!isSupabaseConfigured()) return DEMO_MEMBERS;
  const db = createAdminSupabase();
  const { data } = await db
    .from("org_members")
    .select("user_id, email, role")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  return (data ?? []) as { user_id: string; email: string; role: Role }[];
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

export function newToken() {
  return randomBytes(24).toString("base64url");
}

export async function createOrg(user: SessionUser, name: string) {
  const db = createAdminSupabase();
  const { data: org, error } = await db
    .from("organizations")
    .insert({ name, slug: slugify(name) })
    .select("id, slug, name")
    .single();
  if (error || !org) throw new Error(error?.message ?? "could not create organization");
  const { error: e2 } = await db
    .from("org_members")
    .insert({ org_id: org.id, user_id: user.id, email: user.email, role: "owner" });
  if (e2) {
    await db.from("organizations").delete().eq("id", org.id);
    throw new Error(e2.message);
  }
  return org as { id: string; slug: string; name: string };
}

type Guard =
  | { ok: true; user: SessionUser; org: Org & { role: Role } }
  | { ok: false; response: NextResponse };

const fail = (status: number, error: string): Guard => ({
  ok: false,
  response: NextResponse.json({ error }, { status }),
});

export async function requireUser(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, response: NextResponse.json({ error: "Supabase is not configured" }, { status: 503 }) };
  }
  const user = await getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { ok: true, user };
}

/** Server-side check of session, membership and (optionally) a manager role. */
export async function requireOrg(slug: string, opts: { manage?: boolean } = {}): Promise<Guard> {
  const u = await requireUser();
  if (!u.ok) return u;
  const org = await getMembership(u.user.id, slug);
  if (!org) return fail(404, "Organization not found");
  if (opts.manage && !canManage(org.role)) return fail(403, "Forbidden");
  return { ok: true, user: u.user, org };
}

export async function countPendingInvites(orgId: string) {
  if (!isSupabaseConfigured()) return 1;
  const { count } = await createAdminSupabase()
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}
