/**
 * Shared tenancy types and URL helpers. Client-safe: this module imports
 * nothing server-only, so the provider and the switcher can use it too.
 * The guards live in `./server`, which must never be imported from a
 * client component.
 */

/** Roles are a column on `organization_members`. Ordered weakest to strongest. */
export type OrgRole = "owner" | "admin" | "member";
export const ORG_ROLES: readonly OrgRole[] = ["member", "admin", "owner"];

/** Narrow a stored role string, or null when it is not one we know. */
export function asRole(value: unknown): OrgRole | null {
  return value === "owner" || value === "admin" || value === "member" ? value : null;
}

/** True when `role` is at least as strong as `minimum`. */
export function roleAtLeast(role: OrgRole, minimum: OrgRole): boolean {
  return ORG_ROLES.indexOf(role) >= ORG_ROLES.indexOf(minimum);
}

/** The plans an organization can be on. Every organization starts on `free`. */
export type OrgPlan = "free" | "team";

/** A row of `organizations`, as every read in this app selects it. */
export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: OrgPlan;
  created_at: string;
}

/** An organization plus the signed-in user's role in it. */
export interface OrgMembership extends Organization {
  role: OrgRole;
}

/** A row of `organization_members`, as the members list returns it. */
export interface OrgMember {
  user_id: string;
  email: string | null;
  role: OrgRole;
}

/** An open invitation, as an admin sees it. The token itself is never stored. */
export interface OrgInvitation {
  id: string;
  email: string | null;
  role: Exclude<OrgRole, "owner">;
  created_at: string;
  expires_at: string;
}

/** The segment every org-scoped route hangs off. */
export const ORG_BASE = "/app";

/** The slug used when Supabase is not configured (demo mode). */
export const DEMO_ORG_SLUG = "demo";

/** Where an invitation link points: `/invite/<token>`, outside `/app/`. */
export function invitationPathFor(token: string): string {
  return `/invite/${token}`;
}

/** `/app/acme` + an optional sub-path: `orgPath("acme", "/members")`. */
export function orgPath(slug: string, subPath = ""): string {
  return `${ORG_BASE}/${slug}${subPath}`;
}

/** `^/app/<slug>(/rest)?$`, built from ORG_BASE so there is one source of truth. */
const ORG_PATH_RE = new RegExp(`^${ORG_BASE}/([^/]+)(/.*)?$`);

/** The org slug in a pathname, or null when the path is not org-scoped. */
export function orgSlugFromPath(pathname: string): string | null {
  return ORG_PATH_RE.exec(pathname)?.[1] ?? null;
}

/** The same page under a different organization: `/app/acme/members` with `beta`. */
export function repointOrgPath(pathname: string, slug: string): string {
  return orgPath(slug, ORG_PATH_RE.exec(pathname)?.[2] ?? "");
}
