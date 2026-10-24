export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const PLANS = ["free", "team"] as const;
export type Plan = (typeof PLANS)[number];

/** The Free plan allows up to this many members. */
export const FREE_MEMBER_LIMIT = 3;

/** Invitation links stop working this many days after they are created. */
export const INVITE_TTL_DAYS = 7;

export type Organization = { id: string; slug: string; name: string; plan: Plan };

export type Membership = Organization & { role: Role };

const RANK: Record<Role, number> = { member: 0, admin: 1, owner: 2 };

/** True when `role` is at least `minimum` (owner > admin > member). */
export function hasRole(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** The demo organization, shown in demo mode (no Supabase configured). */
export const DEMO_ORG: Membership = {
  id: "demo",
  slug: "demo",
  name: "Demo organization",
  plan: "free",
  role: "owner",
};
