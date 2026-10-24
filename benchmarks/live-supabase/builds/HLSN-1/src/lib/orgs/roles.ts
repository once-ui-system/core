/** Membership roles. Owners and admins manage the organization; members use it. */
export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

/** Roles an invitation can grant. Ownership is never handed out by a link. */
export const INVITABLE_ROLES = ["member", "admin"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export type Plan = "free" | "team";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isInvitableRole(value: unknown): value is InvitableRole {
  return typeof value === "string" && (INVITABLE_ROLES as readonly string[]).includes(value);
}

/** Owners and admins may invite, rename and upgrade. */
export function canManage(role: Role): boolean {
  return role === "owner" || role === "admin";
}

const RANK: Record<Role, number> = { owner: 0, admin: 1, member: 2 };

export function rankOf(role: Role): number {
  return RANK[role];
}
