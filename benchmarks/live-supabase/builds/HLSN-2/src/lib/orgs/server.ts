/**
 * Tenancy guards (server-only: never import this from a client component).
 *
 * RLS is enabled on `organizations`, `organization_members` and
 * `organization_invitations` with NO policies, and the service-role client
 * used here bypasses RLS. Nothing in the database scopes a row to a tenant:
 * the boundary is these guards. Every org-scoped read or write takes an
 * `AdmittedOrg` (proof a guard admitted the caller) and filters on
 * `admitted.org.id`, never on an id or slug the request carried.
 */
import { ApiError } from "@/lib/errors";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { type ServiceClient, requireUserAndService } from "@/lib/sb/service";
import { isOrgSlug, slugWithSuffix, slugify } from "./slug";
import {
  type OrgMember,
  type OrgMembership,
  type OrgRole,
  type Organization,
  asRole,
  roleAtLeast,
} from "./types";

/** Every column a read of `organizations` selects. */
const ORG_COLUMNS = "id, slug, name, plan, created_at";

/** Postgres unique-violation: a slug collision, or a concurrent insert. */
const UNIQUE_VIOLATION = "23505";

/** Postgres "invalid input syntax": a malformed id, which is a miss, not a fault. */
const INVALID_TEXT_REPRESENTATION = "22P02";

export type OrgGuardFailure = { ok: false; status: number; error: string };

export type OrgGuard =
  | { ok: true; userId: string; org: Organization; role: OrgRole }
  | OrgGuardFailure;

/** Proof that a guard admitted the caller to this organization. */
export type AdmittedOrg = Extract<OrgGuard, { ok: true }>;

/**
 * A non-member is told the organization does not exist, not that they are not
 * in it. A 403 would confirm a slug to anyone who guessed one.
 */
export const NOT_FOUND: OrgGuardFailure = {
  ok: false,
  status: 404,
  error: "Organization not found",
};

/**
 * The signed-in user plus a service-role client, as a result rather than an
 * exception. Guards must not throw, so this is where ApiError is converted.
 * It says who is asking, not what they may reach.
 */
export async function resolveUserAndService(): Promise<
  | { ok: true; userId: string; email: string | null; service: ServiceClient }
  | OrgGuardFailure
> {
  if (!isSupabaseConfigured() || !supabaseSecretKey()) {
    return { ok: false, status: 503, error: "Supabase is not configured. See .env.example." };
  }

  try {
    const { user, serviceClient } = await requireUserAndService();
    return {
      ok: true,
      userId: user.id,
      email: user.email ?? null,
      service: serviceClient,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, status: err.status, error: err.message };
    }
    return { ok: false, status: 500, error: "Failed to resolve the current user" };
  }
}

/** The user's role in one organization, or null when they are not a member. */
async function fetchRole(
  service: ServiceClient,
  organizationId: string,
  userId: string,
): Promise<OrgRole | null> {
  const { data, error } = await service
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return asRole((data as { role: string }).role);
}

/** Resolve an organization by slug, assert membership and the role floor. */
async function resolveAccess(
  service: ServiceClient,
  userId: string,
  slug: string,
  minimumRole: OrgRole,
): Promise<OrgGuard> {
  const { data, error } = await service
    .from("organizations")
    .select(ORG_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error && error.code !== INVALID_TEXT_REPRESENTATION) {
    return { ok: false, status: 500, error: "Failed to load the organization" };
  }
  if (!data) return NOT_FOUND;

  const org = data as unknown as Organization;
  const role = await fetchRole(service, org.id, userId);
  if (!role) return NOT_FOUND;

  if (!roleAtLeast(role, minimumRole)) {
    return {
      ok: false,
      status: 403,
      error: minimumRole === "owner" ? "Owner access required" : "Admin or owner access required",
    };
  }

  return { ok: true, userId, org, role };
}

/** Any member of the organization addressed by `slug`. */
export async function requireOrg(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "member");
}

/** A member holding at least `minimumRole`. */
export async function requireOrgRole(slug: string, minimumRole: OrgRole): Promise<OrgGuard> {
  if (!isOrgSlug(slug)) return NOT_FOUND;

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  return resolveAccess(auth.service, auth.userId, slug, minimumRole);
}

/** Owner or admin: managing members and organization settings. */
export async function requireOrgAdmin(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "admin");
}

/** Owner only. */
export async function requireOrgOwner(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "owner");
}

// ---------------------------------------------------------------------------
// Organizations the signed-in user belongs to
// ---------------------------------------------------------------------------

export type OrgListResult =
  | { ok: true; organizations: OrgMembership[] }
  | OrgGuardFailure;

/** Every organization the signed-in user belongs to, by name. */
export async function listUserOrganizations(): Promise<OrgListResult> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data: rows, error } = await auth.service
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", auth.userId);

  if (error) return { ok: false, status: 500, error: "Failed to load your organizations" };

  const roleById = new Map<string, OrgRole>();
  for (const row of (rows ?? []) as unknown as { organization_id: string; role: string }[]) {
    const role = asRole(row.role);
    if (role) roleById.set(row.organization_id, role);
  }

  if (roleById.size === 0) return { ok: true, organizations: [] };

  const { data: orgRows, error: orgError } = await auth.service
    .from("organizations")
    .select(ORG_COLUMNS)
    .in("id", [...roleById.keys()]);

  if (orgError) return { ok: false, status: 500, error: "Failed to load your organizations" };

  const organizations = ((orgRows ?? []) as unknown as Organization[]).flatMap(
    (org): OrgMembership[] => {
      const role = roleById.get(org.id);
      return role ? [{ ...org, role }] : [];
    },
  );
  organizations.sort((a, b) => a.name.localeCompare(b.name));
  return { ok: true, organizations };
}

export type OrgCreateResult =
  | { ok: true; organization: OrgMembership }
  | OrgGuardFailure;

/** A short, URL-safe suffix for resolving a slug collision. */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Create an organization and make the caller its owner. A slug the caller
 * gave is used as is (409 when taken). A slug derived from the name gets a
 * random suffix on collision, so a name can always be used.
 */
export async function createOrganization(
  name: string,
  requestedSlug: string | null,
): Promise<OrgCreateResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, status: 400, error: "A name is required" };
  if (trimmed.length > 64) return { ok: false, status: 400, error: "A name is at most 64 characters" };

  const derived = requestedSlug === null;
  const base = derived ? slugify(trimmed) : requestedSlug;
  if (!base || !isOrgSlug(base)) {
    return {
      ok: false,
      status: 400,
      error: "A slug must be 2-63 characters of lowercase letters, digits and dashes",
    };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 || !derived ? base : slugWithSuffix(base, randomSuffix());
    const { data, error } = await auth.service
      .from("organizations")
      .insert({ slug, name: trimmed, created_by: auth.userId })
      .select(ORG_COLUMNS)
      .maybeSingle();

    if (error?.code === UNIQUE_VIOLATION) {
      if (!derived) return { ok: false, status: 409, error: "That slug is taken" };
      continue;
    }
    if (error || !data) {
      return { ok: false, status: 500, error: "Failed to create the organization" };
    }

    const org = data as unknown as Organization;
    const joined = await ensureMembership(auth.service, org.id, auth.userId, "owner", auth.email);
    if (!joined.ok) return joined;
    return { ok: true, organization: { ...org, role: "owner" } };
  }

  return { ok: false, status: 409, error: "Could not find a free address for that name" };
}

/**
 * Add a membership row. An existing member keeps the role they have, so an
 * invitation can never demote anyone.
 */
export async function ensureMembership(
  service: ServiceClient,
  organizationId: string,
  userId: string,
  role: OrgRole,
  email: string | null,
): Promise<{ ok: true } | OrgGuardFailure> {
  const { error } = await service
    .from("organization_members")
    .upsert(
      { organization_id: organizationId, user_id: userId, role, email },
      { onConflict: "organization_id,user_id", ignoreDuplicates: true },
    );

  if (error) return { ok: false, status: 500, error: "Failed to join the organization" };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

/** The members of an organization a guard has already admitted the caller to. */
export async function listOrgMembers(
  admitted: AdmittedOrg,
): Promise<{ ok: true; members: OrgMember[] } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organization_members")
    .select("user_id, email, role")
    .eq("organization_id", admitted.org.id)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, status: 500, error: "Failed to load the members" };

  const members = ((data ?? []) as unknown as OrgMember[]).flatMap((m) =>
    asRole(m.role) ? [{ user_id: m.user_id, email: m.email ?? null, role: m.role }] : [],
  );
  return { ok: true, members };
}

/** How many owners an organization has. The last one may not leave or be removed. */
async function countOrgOwners(service: ServiceClient, organizationId: string): Promise<number> {
  const { count } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", "owner");
  return count ?? 0;
}

/** Remove a member. Owners and admins only; only an owner may remove an owner. */
export async function removeOrgMember(
  admitted: AdmittedOrg,
  memberUserId: string,
): Promise<{ ok: true } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const organizationId = admitted.org.id;
  const current = await fetchRole(auth.service, organizationId, memberUserId);
  if (!current) return { ok: false, status: 404, error: "Member not found" };
  if (current === "owner" && admitted.role !== "owner") {
    return { ok: false, status: 403, error: "Owner access required" };
  }
  if (current === "owner" && (await countOrgOwners(auth.service, organizationId)) <= 1) {
    return { ok: false, status: 409, error: "An organization must keep at least one owner" };
  }

  const { error } = await auth.service
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", memberUserId);

  if (error) return { ok: false, status: 500, error: "Failed to remove the member" };
  return { ok: true };
}

/** Leave an organization. The last owner must hand ownership over first. */
export async function leaveOrganization(
  admitted: AdmittedOrg,
): Promise<{ ok: true } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  if (admitted.role === "owner" && (await countOrgOwners(auth.service, admitted.org.id)) <= 1) {
    return {
      ok: false,
      status: 409,
      error: "You are the last owner. Make someone else an owner before leaving.",
    };
  }

  const { error } = await auth.service
    .from("organization_members")
    .delete()
    .eq("organization_id", admitted.org.id)
    .eq("user_id", admitted.userId);

  if (error) return { ok: false, status: 500, error: "Failed to leave the organization" };
  return { ok: true };
}

/** Rename an organization. The slug is immutable: it is in every URL already handed out. */
export async function renameOrganization(
  admitted: AdmittedOrg,
  name: string,
): Promise<{ ok: true; organization: Organization } | OrgGuardFailure> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, status: 400, error: "A name is required" };
  if (trimmed.length > 64) return { ok: false, status: 400, error: "A name is at most 64 characters" };

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organizations")
    .update({ name: trimmed })
    .eq("id", admitted.org.id)
    .select(ORG_COLUMNS)
    .maybeSingle();

  if (error || !data) return { ok: false, status: 500, error: "Failed to rename the organization" };
  return { ok: true, organization: data as unknown as Organization };
}
