export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export type Plan = "free" | "team";

export type Org = {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
};

export type Member = {
  user_id: string;
  email: string;
  role: Role;
};

// Owners and admins manage people and settings. Members only read.
export function canManage(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
