export type Role = "owner" | "admin" | "member";
export type Plan = "free" | "team";
export type InviteRole = "admin" | "member";

export type OrgSummary = {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
  role: Role;
};

export type MemberRow = {
  user_id: string;
  email: string;
  role: Role;
};

export const INVITE_ROLES: readonly InviteRole[] = ["member", "admin"];

// Owners and admins may manage the organization, its members and its billing.
export function canManage(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
