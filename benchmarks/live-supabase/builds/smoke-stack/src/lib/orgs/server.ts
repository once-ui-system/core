/**
 * Tenancy guards (server-only — never import this from a client component).
 *
 * READ THIS BEFORE ADDING A QUERY. RLS is enabled on `organizations` and
 * `organization_members` with NO policies, so Postgres refuses anon and
 * authenticated clients outright and the service-role client used here
 * bypasses it entirely. Nothing in the database scopes a row to a tenant:
 * the boundary is application code and only application code, and one
 * missing organization filter is a cross-tenant leak that produces no error
 * and no log line.
 *
 * So these guards are the boundary, and they are shaped to make the safe
 * thing the easy thing:
 *
 *   - they return a result and never throw, so a route handler is one line
 *     of handling with no exception plumbing to forget;
 *   - there is a family of them rather than one, because reading and
 *     administering are different gates;
 *   - `requireOrgResource` resolves the parent from the child, so a caller
 *     holding only a nested id cannot skip the tenancy check.
 *
 * See docs/composition/multi-tenancy.md.
 */
import { type TablePage, type TableQuery, ilikePattern, pageRange } from "@/lib/data/query";
import { ApiError } from "@/lib/errors";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { type ServiceClient, requireUserAndService } from "@/lib/sb/service";
import { isOrgSlug, slugWithSuffix, slugify } from "./slug";
import {
  type OrgMember,
  type OrgMemberRow,
  type OrgMembership,
  type OrgRole,
  type Organization,
  MEMBERS_QUERY_SPEC,
  roleAtLeast,
} from "./types";

/** Every column a read of `organizations` selects. */
const ORG_COLUMNS = "id, slug, name, personal, created_at";

/** A Postgres identifier: how a table or column name is allowed to look. */
const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

/** Postgres "invalid input syntax for type ..." — a malformed id, not a fault. */
const INVALID_TEXT_REPRESENTATION = "22P02";

/** Postgres unique-violation — a slug collision, or a concurrent insert. */
const UNIQUE_VIOLATION = "23505";

/** Postgres foreign-key violation — a row elsewhere still points at this one. */
const FOREIGN_KEY_VIOLATION = "23503";

/** Every column a members read selects. */
const MEMBER_COLUMNS = "user_id, role, email, created_at";

/**
 * What every guard hands back. The failure branch carries the HTTP status
 * and the message to send, so a route handler reads:
 *
 * ```ts
 * const guard = await requireOrg(slug);
 * if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
 * ```
 */
export type OrgGuard =
  | { ok: true; userId: string; org: Organization; role: OrgRole }
  | { ok: false; status: number; error: string };

/** A guard failure on its own — what the internal helpers return. */
export type OrgGuardFailure = Extract<OrgGuard, { ok: false }>;

/**
 * Proof that a guard admitted the caller to this organization.
 *
 * Every org-scoped read and write below takes one of these rather than a bare
 * organization id, so there is no signature that lets a caller supply an id a
 * guard did not resolve. Same idea as `requireOrgResource`: the check is not
 * something the caller is trusted to have remembered.
 */
export type AdmittedOrg = Extract<OrgGuard, { ok: true }>;

/** `requireOrgResource`, which also hands back the row it resolved through. */
export type OrgResourceGuard<T> =
  | { ok: true; userId: string; org: Organization; role: OrgRole; resource: T }
  | { ok: false; status: number; error: string };

/** The shape `requireOrgResource` needs of any row it gates on. */
export interface OrgScopedRow {
  organization_id: string;
}

/**
 * A non-member is told the organization does not exist, not that they are
 * not in it. The two are deliberately indistinguishable: a 403 here would
 * confirm a slug to anyone who guessed one, which is org enumeration.
 */
const NOT_FOUND: OrgGuardFailure = {
  ok: false,
  status: 404,
  error: "Organization not found",
};

/**
 * The signed-in user plus a service-role client, as a result rather than an
 * exception. `requireUserAndService` throws ApiError; guards must not, so
 * this is where that is converted, exactly once.
 *
 * Exported for the other modules of this slice (invitations, billing). It is
 * NOT a tenancy guard: it says who is asking, not what they may reach, and a
 * query run on its client alone is scoped to nothing.
 */
export async function resolveUserAndService(): Promise<
  | {
      ok: true;
      userId: string;
      email: string | null;
      emailConfirmed: boolean;
      service: ServiceClient;
    }
  | OrgGuardFailure
> {
  // Demo mode: no Supabase env at all. Answer 503 up front rather than
  // letting the SSR client throw and reporting it as a 500.
  if (!isSupabaseConfigured() || !supabaseSecretKey()) {
    return {
      ok: false,
      status: 503,
      error: "Supabase is not configured. See .env.example.",
    };
  }

  try {
    const { user, serviceClient } = await requireUserAndService();
    return {
      ok: true,
      userId: user.id,
      email: user.email ?? null,
      emailConfirmed: Boolean(user.email_confirmed_at),
      service: serviceClient,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, status: err.status, error: err.message };
    }
    return { ok: false, status: 500, error: "Failed to resolve the current user" };
  }
}

/** Narrow a stored role string, or null when it is not one we know. */
export function asRole(value: unknown): OrgRole | null {
  return value === "owner" || value === "admin" || value === "member" ? value : null;
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

/**
 * Resolve an organization by slug or by id, assert membership, and check the
 * role floor. The single place every guard below goes through — which is the
 * point: one implementation of "is this person allowed inside this tenant".
 */
async function resolveAccess(
  service: ServiceClient,
  userId: string,
  by: { slug: string } | { id: string },
  minimumRole: OrgRole,
): Promise<OrgGuard> {
  const query = service.from("organizations").select(ORG_COLUMNS);
  const { data, error } =
    "slug" in by
      ? await query.eq("slug", by.slug).maybeSingle()
      : await query.eq("id", by.id).maybeSingle();

  if (error && error.code !== INVALID_TEXT_REPRESENTATION) {
    return { ok: false, status: 500, error: "Failed to load the organization" };
  }
  if (!data) return NOT_FOUND;

  const org = data as unknown as Organization;
  const role = await fetchRole(service, org.id, userId);

  // Not a member: the same answer as "no such organization". See NOT_FOUND.
  if (!role) return NOT_FOUND;

  // A member, so the organization's existence is no longer a secret and an
  // insufficient role can be reported honestly.
  if (!roleAtLeast(role, minimumRole)) {
    return {
      ok: false,
      status: 403,
      error: minimumRole === "owner" ? "Owner access required" : "Admin or owner access required",
    };
  }

  return { ok: true, userId, org, role };
}

/**
 * Any member of the organization addressed by `slug`.
 *
 * The organization id it hands back is the only value an org-scoped query may
 * filter on. Filtering on an id that arrived from the caller instead is the
 * leak this function exists to prevent.
 */
export async function requireOrg(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "member");
}

/** A member holding at least `minimumRole`. */
export async function requireOrgRole(slug: string, minimumRole: OrgRole): Promise<OrgGuard> {
  // Refuse a slug the database could not hold before spending a roundtrip on
  // it, so a malformed segment never reaches the query at all.
  if (!isOrgSlug(slug)) return NOT_FOUND;

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  return resolveAccess(auth.service, auth.userId, { slug }, minimumRole);
}

/**
 * Owner or admin — managing members, changing organization settings.
 * A separate gate from `requireOrg` on purpose: collapsing the two makes
 * every reader an implicit admin until somebody remembers otherwise.
 */
export async function requireOrgAdmin(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "admin");
}

/** Owner only — the powers that must not be delegated. */
export async function requireOrgOwner(slug: string): Promise<OrgGuard> {
  return requireOrgRole(slug, "owner");
}

/**
 * A nested resource, gated by the organization that owns it — the most
 * important guard in this file.
 *
 * It takes the CHILD's id and looks the parent up itself:
 *
 * ```ts
 * const guard = await requireOrgResource<Booking>("bookings", bookingId, {
 *   columns: ["id", "starts_at"],
 *   minimumRole: "admin",
 * });
 * if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
 * // guard.org is the booking's organization, resolved here — not supplied by the caller.
 * ```
 *
 * A caller holding only a `bookingId` therefore cannot skip the tenancy
 * check, because there is no path to the row that does not go through this
 * lookup. The alternative — passing the organization alongside the child id
 * — is a check the caller can forget, and that is exactly how deep resource
 * trees leak.
 *
 * `table`, `idColumn` and `columns` are interpolated into the query, so they
 * MUST be literals from your own code and never anything a request carried.
 * The shape check below is defence in depth, not sanitising.
 */
export async function requireOrgResource<T extends OrgScopedRow = OrgScopedRow>(
  table: string,
  resourceId: string,
  options: {
    /** Extra columns to return on `resource`; `organization_id` is always included. */
    columns?: string[];
    /** Defaults to `"id"`. */
    idColumn?: string;
    /** Role floor in the owning organization. Defaults to `"member"`. */
    minimumRole?: OrgRole;
    /** What to call the thing in a 404, e.g. `"Booking"`. Defaults to `"Resource"`. */
    label?: string;
  } = {},
): Promise<OrgResourceGuard<T>> {
  const { columns = [], idColumn = "id", minimumRole = "member", label = "Resource" } = options;

  if (![table, idColumn, ...columns].every((name) => IDENTIFIER.test(name))) {
    // A caller bug, not a request problem: fail closed and loudly.
    return { ok: false, status: 500, error: "Invalid table or column name" };
  }
  if (typeof resourceId !== "string" || resourceId.length === 0) {
    return { ok: false, status: 404, error: `${label} not found` };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const select = ["organization_id", ...columns.filter((c) => c !== "organization_id")].join(", ");
  const { data, error } = await auth.service
    .from(table)
    .select(select)
    .eq(idColumn, resourceId)
    .maybeSingle();

  // A malformed id (a non-uuid where the column is a uuid) is a miss rather
  // than a server fault, and 404 keeps it indistinguishable from one.
  if (error && error.code !== INVALID_TEXT_REPRESENTATION) {
    return { ok: false, status: 500, error: `Failed to load the ${label.toLowerCase()}` };
  }
  if (!data) return { ok: false, status: 404, error: `${label} not found` };

  const row = data as unknown as T;
  const guard = await resolveAccess(
    auth.service,
    auth.userId,
    { id: row.organization_id },
    minimumRole,
  );

  // The row exists but its organization does not admit this user. Report a
  // missing resource: that the id is real is not theirs to learn.
  if (!guard.ok) {
    return guard.status === 404 ? { ok: false, status: 404, error: `${label} not found` } : guard;
  }

  return { ok: true, userId: guard.userId, org: guard.org, role: guard.role, resource: row };
}

// ---------------------------------------------------------------------------
// The personal organization, and the list the switcher reads
// ---------------------------------------------------------------------------

/** A short, URL-safe suffix for resolving a slug collision. */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * The slug a new personal organization tries first, derived from the email
 * local part. Falls back to the user id, which is always long enough, and
 * finally to a constant — a tenant must always be addressable.
 */
function personalSlugBase(email: string | null | undefined, userId: string): string {
  return slugify(email?.split("@")[0] ?? "") || slugify(userId.replace(/-/g, "")) || "workspace";
}

/**
 * Create the user's personal organization, or return the one they have.
 *
 * Lazily, on the first authenticated request that needs it — never from a
 * trigger on `auth.users`, which on a Supabase project shared with other
 * products would fire for every one of their sign-ups too.
 *
 * Two things can collide here, and the retry loop handles both: the slug is
 * globally unique, and `organizations_one_personal_per_user` allows exactly
 * one personal organization per user. Two concurrent first requests are the
 * normal case for the second one — the loser re-reads and returns the row
 * the winner made.
 */
async function ensurePersonalOrg(
  service: ServiceClient,
  userId: string,
  email: string | null | undefined,
): Promise<{ ok: true; org: Organization } | OrgGuardFailure> {
  const findExisting = async (): Promise<Organization | null> => {
    const { data } = await service
      .from("organizations")
      .select(ORG_COLUMNS)
      .eq("created_by", userId)
      .eq("personal", true)
      .maybeSingle();
    return (data as unknown as Organization) ?? null;
  };

  const base = personalSlugBase(email, userId);
  const name = email?.split("@")[0] || "Personal";

  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await findExisting();
    if (existing) {
      // The membership row is what every guard reads, so a half-finished
      // earlier attempt is repaired rather than left to 404 forever.
      const joined = await ensureMembership(service, existing.id, userId, "owner", email);
      return joined.ok ? { ok: true, org: existing } : joined;
    }

    const slug = attempt === 0 ? base : slugWithSuffix(base, randomSuffix());
    const { data, error } = await service
      .from("organizations")
      .insert({ slug, name, personal: true, created_by: userId })
      .select(ORG_COLUMNS)
      .maybeSingle();

    if (!error && data) {
      const org = data as unknown as Organization;
      const joined = await ensureMembership(service, org.id, userId, "owner", email);
      return joined.ok ? { ok: true, org } : joined;
    }

    // Anything but a collision is a real failure; a collision loops, and the
    // re-read at the top of the next pass settles which kind it was.
    if (error?.code !== UNIQUE_VIOLATION) {
      return { ok: false, status: 500, error: "Failed to create your personal organization" };
    }
  }

  return { ok: false, status: 500, error: "Failed to create your personal organization" };
}

/**
 * Add a membership row, treating "already a member" as success — an existing
 * member keeps the role they have, so an invitation can never demote anyone.
 */
export async function ensureMembership(
  service: ServiceClient,
  organizationId: string,
  userId: string,
  role: OrgRole,
  email?: string | null,
): Promise<{ ok: true } | OrgGuardFailure> {
  const { error } = await service
    .from("organization_members")
    .upsert(
      { organization_id: organizationId, user_id: userId, role, email: email ?? null },
      { onConflict: "organization_id,user_id", ignoreDuplicates: true },
    );

  if (error) return { ok: false, status: 500, error: "Failed to join the organization" };
  return { ok: true };
}

export type OrgListResult =
  | { ok: true; userId: string; organizations: OrgMembership[] }
  | { ok: false; status: number; error: string };

/**
 * Every organization the signed-in user belongs to, personal one first and
 * the rest by name — the list behind the workspace switcher.
 *
 * This is also where the personal organization gets created, because it is
 * the first authenticated request the product shell makes. No user is ever
 * tenant-less after it, which is what lets an app adopting tenancy later
 * backfill `organization_id` on every existing row rather than handling a
 * null case forever.
 */
export async function listUserOrganizations(): Promise<OrgListResult> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { service, userId, email } = auth;

  const { data: rows, error } = await service
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId);

  if (error) {
    return { ok: false, status: 500, error: "Failed to load your organizations" };
  }

  const memberships = (rows ?? []) as unknown as { organization_id: string; role: string }[];
  const roleById = new Map(
    memberships.flatMap((m) => {
      const role = asRole(m.role);
      return role ? [[m.organization_id, role] as const] : [];
    }),
  );

  let organizations: OrgMembership[] = [];

  if (roleById.size > 0) {
    const { data: orgRows, error: orgError } = await service
      .from("organizations")
      .select(ORG_COLUMNS)
      .in("id", [...roleById.keys()]);

    if (orgError) {
      return { ok: false, status: 500, error: "Failed to load your organizations" };
    }

    organizations = ((orgRows ?? []) as unknown as Organization[]).flatMap(
      (org): OrgMembership[] => {
        const role = roleById.get(org.id);
        return role ? [{ ...org, role }] : [];
      },
    );
  }

  // Every user has a personal organization — not just every user who has no
  // organizations. Once invitations exist, somebody's first authenticated
  // request can arrive with a membership in someone else's org and none of
  // their own, and the universality that lets an app backfill
  // `organization_id` on every existing row has to survive that.
  // Fill in the caller's address on memberships that predate the `email`
  // column, so the members table can show and search it. One cheap update,
  // and only when there is something to fill.
  if (email) {
    await service
      .from("organization_members")
      .update({ email })
      .eq("user_id", userId)
      .is("email", null);
  }

  if (!organizations.some((org) => org.personal)) {
    const personal = await ensurePersonalOrg(service, userId, email);
    if (!personal.ok) return personal;
    organizations = [{ ...personal.org, role: "owner" }, ...organizations];
  }

  organizations.sort(
    (a, b) => Number(b.personal) - Number(a.personal) || a.name.localeCompare(b.name),
  );

  return { ok: true, userId, organizations };
}

export type OrgCreateResult =
  | { ok: true; organization: OrgMembership }
  | { ok: false; status: number; error: string };

/**
 * Create an organization and make the caller its owner. Not personal: a user
 * has exactly one of those and it is made lazily, not through this path.
 */
export async function createOrganization(name: string, slug: string): Promise<OrgCreateResult> {
  if (!isOrgSlug(slug)) {
    return {
      ok: false,
      status: 400,
      error: "A slug must be 2-63 characters of lowercase letters, digits and dashes",
    };
  }
  if (!name.trim()) {
    return { ok: false, status: 400, error: "A name is required" };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organizations")
    .insert({ slug, name: name.trim(), personal: false, created_by: auth.userId })
    .select(ORG_COLUMNS)
    .maybeSingle();

  if (error?.code === UNIQUE_VIOLATION) {
    return { ok: false, status: 409, error: "That slug is taken" };
  }
  if (error || !data) {
    return { ok: false, status: 500, error: "Failed to create the organization" };
  }

  const org = data as unknown as Organization;
  const joined = await ensureMembership(auth.service, org.id, auth.userId, "owner", auth.email);
  if (!joined.ok) return joined;

  return { ok: true, organization: { ...org, role: "owner" } };
}

/** The members of an organization a guard has already admitted the caller to. */
export async function listOrgMembers(
  admitted: AdmittedOrg,
): Promise<{ ok: true; members: OrgMember[] } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organization_members")
    .select(MEMBER_COLUMNS)
    .eq("organization_id", admitted.org.id)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, status: 500, error: "Failed to load the members" };

  const members = ((data ?? []) as unknown as OrgMember[]).flatMap((m) =>
    asRole(m.role) ? [m] : [],
  );
  return { ok: true, members };
}

/**
 * One page of an organization's members, searched by email, filtered by role
 * and sorted on the server — what the Users page's DataTable reads in server
 * mode. Profiles come from a second query by id: `organization_members` and
 * `profiles` both reference `auth.users` and not each other, so PostgREST has
 * no relationship to embed through.
 */
export async function listOrgMembersPage(
  admitted: AdmittedOrg,
  query: TableQuery,
): Promise<{ ok: true; page: TablePage<OrgMemberRow> } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  let request = auth.service
    .from("organization_members")
    .select(MEMBER_COLUMNS, { count: "exact" })
    .eq("organization_id", admitted.org.id);

  if (query.filters.role) request = request.eq("role", query.filters.role);
  if (query.q) request = request.ilike("email", ilikePattern(query.q));

  const sort = query.sort ?? MEMBERS_QUERY_SPEC.defaultSort;
  const [from, to] = pageRange(query);
  const { data, error, count } = await request
    .order(sort.key, { ascending: sort.direction === "asc", nullsFirst: false })
    .order("user_id", { ascending: true })
    .range(from, to);

  if (error) return { ok: false, status: 500, error: "Failed to load the members" };

  const members = ((data ?? []) as unknown as OrgMember[]).flatMap((m) =>
    asRole(m.role) ? [m] : [],
  );

  const ids = members.map((m) => m.user_id);
  const profiles = new Map<string, { username: string | null; full_name: string | null; avatar_url: string | null }>();
  if (ids.length > 0) {
    const { data: rows } = await auth.service
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", ids);
    for (const row of (rows ?? []) as unknown as {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    }[]) {
      profiles.set(row.id, row);
    }
  }

  const rows: OrgMemberRow[] = members.map((m) => {
    const profile = profiles.get(m.user_id);
    return {
      ...m,
      username: profile?.username ?? null,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      you: m.user_id === admitted.userId,
    };
  });

  return { ok: true, page: { rows, count: count ?? rows.length, page: query.page, perPage: query.perPage } };
}

/** How many owners an organization has — the last one may not be demoted. */
async function countOrgOwners(service: ServiceClient, organizationId: string): Promise<number> {
  const { count } = await service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", "owner");

  return count ?? 0;
}

export type OrgMemberWriteResult =
  | { ok: true; member: OrgMember }
  | { ok: false; status: number; error: string };

/**
 * Only an owner may change or remove another owner. `requireOrgAdmin` gets
 * you into the members list; it does not get you authority over the people
 * above you in it.
 */
function mayActOnOwner(admitted: AdmittedOrg, targetRole: OrgRole): boolean {
  return targetRole !== "owner" || admitted.role === "owner";
}

/**
 * Change a member's role inside an organization a guard has already admitted
 * the caller to as an admin.
 *
 * Only an owner may make someone an owner. That is how ownership is handed
 * over: an owner promotes the successor, then steps down or leaves — two
 * steps, each one refusable, and at no point an organization nobody owns.
 * Demoting the last owner is refused for the same reason: an organization
 * nobody owns cannot be recovered.
 */
export async function setOrgMemberRole(
  admitted: AdmittedOrg,
  memberUserId: string,
  role: OrgRole,
): Promise<OrgMemberWriteResult> {
  if (role === "owner" && admitted.role !== "owner") {
    return { ok: false, status: 403, error: "Only an owner can make someone an owner" };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const organizationId = admitted.org.id;
  const current = await fetchRole(auth.service, organizationId, memberUserId);
  if (!current) return { ok: false, status: 404, error: "Member not found" };

  if (!mayActOnOwner(admitted, current)) {
    return { ok: false, status: 403, error: "Owner access required" };
  }
  if (current === "owner" && (await countOrgOwners(auth.service, organizationId)) <= 1) {
    return { ok: false, status: 409, error: "An organization must keep at least one owner" };
  }

  const { data, error } = await auth.service
    .from("organization_members")
    .update({ role })
    .eq("organization_id", organizationId)
    .eq("user_id", memberUserId)
    .select(MEMBER_COLUMNS)
    .maybeSingle();

  if (error || !data) return { ok: false, status: 500, error: "Failed to update the member" };
  return { ok: true, member: data as unknown as OrgMember };
}

/**
 * Remove a member from an organization the caller administers. The last
 * owner stays, for the same reason they cannot be demoted.
 */
export async function removeOrgMember(
  admitted: AdmittedOrg,
  memberUserId: string,
): Promise<{ ok: true } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const organizationId = admitted.org.id;
  const current = await fetchRole(auth.service, organizationId, memberUserId);
  if (!current) return { ok: false, status: 404, error: "Member not found" };

  if (!mayActOnOwner(admitted, current)) {
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

/**
 * Leave an organization — any member, about themselves, so it is gated by
 * `requireOrg` rather than the admin guard `removeOrgMember` needs. The last
 * owner cannot leave (hand ownership over first), and nobody leaves their
 * personal organization: every user keeps one, which is the invariant the
 * backfill story in docs/composition/multi-tenancy.md rests on.
 */
export async function leaveOrganization(
  admitted: AdmittedOrg,
): Promise<{ ok: true } | OrgGuardFailure> {
  if (admitted.org.personal) {
    return { ok: false, status: 409, error: "You can't leave your personal organization" };
  }

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

/**
 * Delete an organization — owner only, never a personal one.
 *
 * Members and invitations go with it (`on delete cascade`). Anything another
 * slice keeps that must outlive a careless click — a live subscription in the
 * billing slice — references the organization with `on delete restrict`
 * instead, and that refusal surfaces here as a 409 rather than a silent
 * orphan: deleting a tenant must never leave a card being charged.
 */
export async function deleteOrganization(
  admitted: AdmittedOrg,
): Promise<{ ok: true } | OrgGuardFailure> {
  if (admitted.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  if (admitted.org.personal) {
    return { ok: false, status: 409, error: "Your personal organization can't be deleted" };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { error } = await auth.service.from("organizations").delete().eq("id", admitted.org.id);

  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return {
      ok: false,
      status: 409,
      error: "This organization has an active subscription. Cancel it before deleting the organization.",
    };
  }
  if (error) return { ok: false, status: 500, error: "Failed to delete the organization" };
  return { ok: true };
}

/**
 * Rename an organization the caller administers. The slug is deliberately
 * immutable: it is in every URL the tenant has ever handed out, and changing
 * it needs a redirect story this slice does not have yet.
 */
export async function renameOrganization(
  admitted: AdmittedOrg,
  name: string,
): Promise<{ ok: true; organization: Organization } | OrgGuardFailure> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, status: 400, error: "A name is required" };

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
