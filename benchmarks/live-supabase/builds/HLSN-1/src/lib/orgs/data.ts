import { createAdminClient } from "@/lib/sb/admin";
import { rankOf, type InvitableRole, type Plan, type Role } from "./roles";
import type { MemberRow, OrgRow, OrgWithRole } from "./types";
import { slugFor } from "./slug";

/**
 * Database access for organizations, memberships and invitations. Every
 * function takes an id the caller has already checked (see guard.ts), except
 * findOrgBySlug and findInvitationByHash, which resolve the lookup itself.
 */

type UserLike = { id: string; email?: string | null };

export async function findOrgBySlug(slug: string): Promise<OrgRow | null> {
  const { data, error } = await createAdminClient()
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as OrgRow | null) ?? null;
}

export async function membershipRole(orgId: string, userId: string): Promise<Role | null> {
  const { data, error } = await createAdminClient()
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.role as Role | undefined) ?? null;
}

/** The organizations a user belongs to, oldest first, with their role in each. */
export async function listOrgsForUser(userId: string): Promise<OrgWithRole[]> {
  const { data, error } = await createAdminClient()
    .from("organization_members")
    .select("role, organization:organizations(id, slug, name, plan, created_at)")
    .eq("user_id", userId);
  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    role: Role;
    organization: OrgRow & { created_at: string };
  }[];

  return rows
    .filter((row) => row.organization)
    .sort((a, b) => a.organization.created_at.localeCompare(b.organization.created_at))
    .map((row) => ({
      id: row.organization.id,
      slug: row.organization.slug,
      name: row.organization.name,
      plan: row.organization.plan,
      role: row.role,
    }));
}

/**
 * Creates an organization with the user as its owner. The slug is retried
 * on a collision, and the organization is removed again if the owner row
 * cannot be written, so no tenant is left without an owner.
 */
export async function createOrganization(name: string, user: UserLike): Promise<OrgRow> {
  const db = createAdminClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await db
      .from("organizations")
      .insert({ slug: slugFor(name), name, plan: "free", created_by: user.id })
      .select("id, slug, name, plan")
      .single();

    if (error?.code === "23505") continue;
    if (error) throw error;

    const org = data as OrgRow;
    const { error: memberError } = await db.from("organization_members").insert({
      organization_id: org.id,
      user_id: user.id,
      email: user.email ?? null,
      role: "owner",
    });
    if (memberError) {
      await db.from("organizations").delete().eq("id", org.id);
      throw memberError;
    }
    return org;
  }

  throw new Error("Could not allocate a slug for the organization");
}

export async function renameOrganization(orgId: string, name: string): Promise<OrgRow> {
  const { data, error } = await createAdminClient()
    .from("organizations")
    .update({ name })
    .eq("id", orgId)
    .select("id, slug, name, plan")
    .single();
  if (error) throw error;
  return data as OrgRow;
}

export async function listMembers(orgId: string): Promise<MemberRow[]> {
  const { data, error } = await createAdminClient()
    .from("organization_members")
    .select("user_id, email, role, created_at")
    .eq("organization_id", orgId);
  if (error) throw error;

  return ((data ?? []) as MemberRow[]).sort(
    (a, b) => rankOf(a.role) - rankOf(b.role) || a.created_at.localeCompare(b.created_at),
  );
}

export async function countMembers(orgId: string): Promise<number> {
  const { count, error } = await createAdminClient()
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  if (error) throw error;
  return count ?? 0;
}

export async function countPendingInvitations(orgId: string): Promise<number> {
  const { count, error } = await createAdminClient()
    .from("organization_invitations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .gt("expires_at", new Date().toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function insertInvitation(input: {
  orgId: string;
  email: string | null;
  role: InvitableRole;
  tokenHash: string;
  invitedBy: string;
  expiresAt: Date;
}): Promise<void> {
  const { error } = await createAdminClient().from("organization_invitations").insert({
    organization_id: input.orgId,
    email: input.email,
    role: input.role,
    token_hash: input.tokenHash,
    invited_by: input.invitedBy,
    expires_at: input.expiresAt.toISOString(),
  });
  if (error) throw error;
}

export type InvitationRecord = {
  role: InvitableRole;
  expires_at: string;
  organization: OrgRow;
};

export async function findInvitationByHash(tokenHash: string): Promise<InvitationRecord | null> {
  const { data, error } = await createAdminClient()
    .from("organization_invitations")
    .select("role, expires_at, organization:organizations(id, slug, name, plan)")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as InvitationRecord | null) ?? null;
}

/**
 * Adds a user to an organization. An existing membership is left as it is,
 * so accepting twice never changes a role.
 */
export async function addMember(input: {
  orgId: string;
  userId: string;
  email: string | null;
  role: Role;
}): Promise<Role> {
  const db = createAdminClient();
  const existing = await membershipRole(input.orgId, input.userId);
  if (existing) return existing;

  const { error } = await db.from("organization_members").upsert(
    {
      organization_id: input.orgId,
      user_id: input.userId,
      email: input.email,
      role: input.role,
    },
    { onConflict: "organization_id,user_id", ignoreDuplicates: true },
  );
  if (error) throw error;
  return input.role;
}

export async function setPlanTeam(orgId: string): Promise<void> {
  const plan: Plan = "team";
  const { error } = await createAdminClient()
    .from("organizations")
    .update({ plan })
    .eq("id", orgId);
  if (error) throw error;
}
