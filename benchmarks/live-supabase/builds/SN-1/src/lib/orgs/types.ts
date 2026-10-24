/**
 * Shared tenancy types and URL helpers. Client-safe: this module imports
 * nothing server-only, so the provider and the switcher can use it too.
 * The guards live in `./server`, which must never be imported from a
 * client component.
 */

/**
 * Roles are a column on `organization_members`, not a table. Three of them,
 * the same three Aveiro settled on. An app that grows into per-resource
 * permissions layers a capability map on top — see docs/composition/
 * multi-tenancy.md, "Roles now, capabilities later".
 */
export type OrgRole = "owner" | "admin" | "member";

/** Ordered weakest to strongest; `roleAtLeast` compares on this. */
export const ORG_ROLES: readonly OrgRole[] = ["member", "admin", "owner"];

/** True when `role` is at least as strong as `minimum`. */
export function roleAtLeast(role: OrgRole, minimum: OrgRole): boolean {
  return ORG_ROLES.indexOf(role) >= ORG_ROLES.indexOf(minimum);
}

/** A row of `organizations`, as every read in this app selects it. */
export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "team";
  personal: boolean;
  created_at: string;
}

/** An organization plus the signed-in user's role in it. */
export interface OrgMembership extends Organization {
  role: OrgRole;
}

/** A row of `organization_members`, for the members list. */
export interface OrgMember {
  user_id: string;
  role: OrgRole;
  /** The address they joined with; null on rows that predate the column. */
  email: string | null;
  created_at: string;
}

/** An open invitation, as an admin sees it. The token is never stored or returned. */
export interface OrgInvitation {
  id: string;
  email: string | null;
  role: Exclude<OrgRole, "owner">;
  created_at: string;
  expires_at: string;
}

/**
 * The segment every org-scoped route hangs off.
 *
 * Deliberately not the URL root. A composed app shares its root with every
 * surface it was scaffolded with (`/docs`, `/store`, `/journal`, …), Next
 * resolves static segments before dynamic ones, and so a root-level org
 * slugged `store` would be shadowed by the store surface — and adding that
 * surface later would break a tenant that already existed. One dedicated
 * segment removes the whole class of problem, and nothing static lives
 * beside `[org]` under it.
 */
export const ORG_BASE = "/app";

/**
 * The slug used when Supabase is not configured. Every composition has to
 * build and run with no environment at all, so the org routes render for an
 * arbitrary slug in demo mode rather than 404ing on an empty database.
 */
export const DEMO_ORG_SLUG = "demo";

/** Where an invitation link points: `/invite/<token>`, outside `/app/`. */
export function invitationPathFor(token: string): string {
  return `/invite/${token}`;
}

/** `/app/acme` + an optional sub-path: `orgPath("acme", "/settings")`. */
export function orgPath(slug: string, subPath = ""): string {
  return `${ORG_BASE}/${slug}${subPath}`;
}

/** `^/app/<slug>(/rest)?$`, built from ORG_BASE so there is one source of truth. */
const ORG_PATH_RE = new RegExp(`^${ORG_BASE}/([^/]+)(/.*)?$`);

/**
 * The org slug in a pathname, or null when the path is not org-scoped.
 * `/app/acme/settings` -> `"acme"`, `/profile` -> `null`.
 */
export function orgSlugFromPath(pathname: string): string | null {
  return ORG_PATH_RE.exec(pathname)?.[1] ?? null;
}

/**
 * The same page under a different tenant: `/app/acme/settings` with `beta`
 * becomes `/app/beta/settings`. Switching organizations is a re-root, not a
 * navigation to a fixed landing page — the switcher keeps you where you are.
 * A path that is not org-scoped falls back to that org's home.
 */
export function repointOrgPath(pathname: string, slug: string): string {
  return orgPath(slug, ORG_PATH_RE.exec(pathname)?.[2] ?? "");
}
