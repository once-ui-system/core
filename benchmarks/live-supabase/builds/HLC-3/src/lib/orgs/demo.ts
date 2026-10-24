import type { Member, Org } from "./types";

// Sample workspace shown when Supabase is not configured (demo mode).
export const DEMO_USER = { id: "demo-user", email: "demo@example.com" };

export const DEMO_ORG: Org = {
  id: "demo-org",
  slug: "demo",
  name: "Demo workspace",
  plan: "free",
};

export const DEMO_MEMBERS: Member[] = [
  { user_id: "demo-user", email: "demo@example.com", role: "owner" },
  { user_id: "demo-admin", email: "admin@example.com", role: "admin" },
  { user_id: "demo-member", email: "member@example.com", role: "member" },
];
