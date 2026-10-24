import "server-only";
import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { INVITE_TTL_MS, type InviteRole, type MemberRow, type OrgSummary } from "./types";

// Data access for organizations. Every call runs as the signed-in user, so row
// level security and the database functions enforce membership. Role checks
// done in callers are for clear errors; the database has the final say.

export async function listMyOrganizations(sb: SupabaseClient): Promise<OrgSummary[]> {
  const { data, error } = await sb.rpc("my_organizations");
  if (error) throw new Error(error.message);
  return (data ?? []) as OrgSummary[];
}

export async function listMembers(sb: SupabaseClient, orgId: string): Promise<MemberRow[]> {
  const { data, error } = await sb.rpc("list_members", { p_org: orgId });
  if (error) throw new Error(error.message);
  return (data ?? []) as MemberRow[];
}

export async function createOrganization(sb: SupabaseClient, name: string): Promise<OrgSummary> {
  const { data, error } = await sb.rpc("create_organization", { p_name: name, p_slug: makeSlug(name) });
  if (error) throw new Error(error.message);
  const row = data as { id: string; slug: string; name: string; plan: OrgSummary["plan"] };
  return { ...row, role: "owner" };
}

export async function renameOrganization(sb: SupabaseClient, orgId: string, name: string): Promise<void> {
  const { data, error } = await sb.from("organizations").update({ name }).eq("id", orgId).select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Organization not found or not allowed");
}

export async function createInvitation(
  sb: SupabaseClient,
  input: { orgId: string; createdBy: string; email: string | null; role: InviteRole },
): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const { error } = await sb.from("invitations").insert({
    org_id: input.orgId,
    token,
    email: input.email,
    role: input.role,
    created_by: input.createdBy,
    expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}

// Joins the caller to the invitation's organization. Null when the token is
// unknown or expired. An existing membership keeps its role.
export async function acceptInvitation(sb: SupabaseClient, token: string): Promise<OrgSummary | null> {
  const { data, error } = await sb.rpc("accept_invitation", { p_token: token });
  if (error) throw new Error(error.message);
  const membership = data as { org_id: string; role: OrgSummary["role"] } | null;
  if (!membership) return null;
  const { data: org, error: orgError } = await sb
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("id", membership.org_id)
    .single();
  if (orgError) throw new Error(orgError.message);
  return { ...(org as Omit<OrgSummary, "role">), role: membership.role };
}

export async function setPlanToTeam(orgId: string, admin: SupabaseClient): Promise<boolean> {
  const { data, error } = await admin.from("organizations").update({ plan: "team" }).eq("id", orgId).select("id");
  if (error) throw new Error(error.message);
  return Boolean(data && data.length > 0);
}

// Lowercase, ASCII slug with a random suffix, so two organizations named alike never collide.
export function makeSlug(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
  return `${base || "org"}-${randomBytes(3).toString("hex")}`;
}
