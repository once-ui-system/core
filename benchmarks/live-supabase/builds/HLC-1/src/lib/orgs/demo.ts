import type { Member, OrgWithRole } from "./types";

// Sample data for demo mode (no Supabase configured).
export const DEMO_USER = { id: "demo-user", email: "demo@example.com" };

export const DEMO_ORG: OrgWithRole = {
  id: "demo-org",
  slug: "demo",
  name: "Demo team",
  plan: "free",
  role: "owner",
};

export const DEMO_MEMBERS: Member[] = [
  { user_id: "demo-user", email: "demo@example.com", role: "owner" },
  { user_id: "demo-2", email: "alex@example.com", role: "admin" },
  { user_id: "demo-3", email: "sam@example.com", role: "member" },
];

export const DEMO_STATS = {
  notebooks: 4,
  notes: 128,
  pendingInvitations: 1,
};
