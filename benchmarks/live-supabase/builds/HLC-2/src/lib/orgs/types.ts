export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const PLANS = ["free", "team"] as const;
export type Plan = (typeof PLANS)[number];

export type Org = { id: string; slug: string; name: string; plan: Plan };

export type OrgAccess = { org: Org; role: Role };

export type Member = { user_id: string; email: string; role: Role };

export function canManage(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export const roleLabel: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const planLabel: Record<Plan, string> = {
  free: "Free",
  team: "Team",
};
