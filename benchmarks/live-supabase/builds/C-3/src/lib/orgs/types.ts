export type Role = "owner" | "admin" | "member";
export type Plan = "free" | "team";

export const DEMO_ORG = {
  id: "00000000-0000-0000-0000-000000000000",
  slug: "demo",
  name: "Demo Team",
  plan: "free" as Plan,
  role: "owner" as Role,
};

export function canManage(role: Role): boolean {
  return role === "owner" || role === "admin";
}
