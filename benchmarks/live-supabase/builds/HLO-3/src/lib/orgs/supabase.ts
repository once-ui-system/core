// Supabase implementation. Reads and writes with the viewer's session, so row level
// security enforces tenancy; the functions in supabase/migrations do the writes that need them.
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "../supabase/server";
import { createSupabaseAdminClient } from "../supabase/admin";
import { INVITE_DAYS, type AcceptResult, type Member, type Org, type OrgAccess, type Plan, type Repo, type Role, type Viewer } from "./types";

const ORG_COLUMNS = "id, slug, name, plan, created_at";

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "unknown error"}`);
}

export const supabaseRepo: Repo = {
  async listOrgs(viewer) {
    const sb = await createSupabaseServerClient();
    const [orgs, mine] = await Promise.all([
      sb.from("organizations").select(ORG_COLUMNS).order("created_at", { ascending: true }),
      sb.from("memberships").select("org_id, role").eq("user_id", viewer.id),
    ]);
    if (orgs.error) fail("list organizations", orgs.error);
    if (mine.error) fail("list memberships", mine.error);
    const roles = new Map((mine.data ?? []).map((m) => [m.org_id, m.role as Role]));
    return ((orgs.data ?? []) as Org[])
      .filter((o) => roles.has(o.id))
      .map((o) => ({ ...o, role: roles.get(o.id) as Role }));
  },

  async findOrg(viewer, slug) {
    const sb = await createSupabaseServerClient();
    const { data: org, error } = await sb.from("organizations").select(ORG_COLUMNS).eq("slug", slug).maybeSingle();
    if (error) fail("find organization", error);
    if (!org) return null;
    const { data: membership, error: mError } = await sb
      .from("memberships")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", viewer.id)
      .maybeSingle();
    if (mError) fail("find membership", mError);
    return membership ? ({ ...(org as Org), role: membership.role as Role } satisfies OrgAccess) : null;
  },

  async createOrg(_viewer, name) {
    const sb = await createSupabaseServerClient();
    const { data, error } = await sb.rpc("create_organization", { p_name: name });
    if (error) fail("create organization", error);
    return data as Org;
  },

  async renameOrg(_viewer, orgId, name) {
    const sb = await createSupabaseServerClient();
    const { data, error } = await sb.from("organizations").update({ name: name.trim() }).eq("id", orgId).select("id");
    if (error) fail("rename organization", error);
    return (data ?? []).length > 0;
  },

  async listMembers(orgId) {
    const sb = await createSupabaseServerClient();
    const { data: rows, error } = await sb
      .from("memberships")
      .select("user_id, role, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });
    if (error) fail("list members", error);
    const ids = (rows ?? []).map((r) => r.user_id);
    const { data: profiles, error: pError } = await sb.from("profiles").select("id, email").in("id", ids);
    if (pError) fail("list profiles", pError);
    const emails = new Map((profiles ?? []).map((p) => [p.id, p.email]));
    return (rows ?? []).map((r) => ({
      user_id: r.user_id,
      email: emails.get(r.user_id) ?? "",
      role: r.role as Role,
    })) satisfies Member[];
  },

  async createInvitation(viewer, orgId, email, role) {
    const sb = await createSupabaseServerClient();
    const token = randomBytes(32).toString("base64url");
    const expires_at = new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString();
    const { data, error } = await sb
      .from("invitations")
      .insert({ org_id: orgId, email, role, token, invited_by: viewer.id, expires_at })
      .select("token, expires_at")
      .single();
    if (error) fail("create invitation", error);
    return { token: data.token, expires_at: data.expires_at };
  },

  async acceptInvitation(_viewer, token): Promise<AcceptResult> {
    const sb = await createSupabaseServerClient();
    const { data, error } = await sb.rpc("accept_invitation", { p_token: token });
    if (error) fail("accept invitation", error);
    const result = data as { status: string; id?: string; slug?: string; name?: string; role?: Role };
    if (result.status === "ok") {
      return { status: "ok", id: result.id!, slug: result.slug!, name: result.name!, role: result.role! };
    }
    return { status: result.status === "expired" ? "expired" : "not_found" };
  },

  async setPlan(orgId, plan: Plan) {
    // Webhook only: no user session, so the service role writes the plan.
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("organizations").update({ plan }).eq("id", orgId);
    if (error) fail("set plan", error);
  },
};
