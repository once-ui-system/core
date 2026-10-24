// Plain types and role rules, safe to import from client and server code.

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const INVITABLE_ROLES = ["member", "admin"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const PLANS = ["free", "team"] as const;
export type Plan = (typeof PLANS)[number];

export type Org = {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
};

export type OrgWithRole = Org & { role: Role };

export type Member = {
  user_id: string;
  email: string;
  role: Role;
};

export const INVITE_TTL_DAYS = 7;

export function canManage(role: Role | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isInvitableRole(value: unknown): value is InvitableRole {
  return typeof value === "string" && (INVITABLE_ROLES as readonly string[]).includes(value);
}

export function isSafeNext(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
}
