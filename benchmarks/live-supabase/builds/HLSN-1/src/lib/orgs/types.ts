import type { Plan, Role } from "./roles";

export type OrgRow = {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
};

export type OrgWithRole = OrgRow & { role: Role };

export type MemberRow = {
  user_id: string;
  email: string | null;
  role: Role;
  created_at: string;
};
