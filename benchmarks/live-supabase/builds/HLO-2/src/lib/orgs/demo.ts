import type { MemberRow, OrgSummary } from "./types";

// Sample data for demo mode (no Supabase variables set). Nothing here is written anywhere.
export const demoUser = { id: "demo-user", email: "demo@example.com" };

export const demoOrgs: OrgSummary[] = [
  { id: "demo-team", slug: "demo-team", name: "Demo team", plan: "free", role: "owner" },
  { id: "demo-field", slug: "field-notes", name: "Field notes", plan: "team", role: "member" },
];

export const demoMembers: Record<string, MemberRow[]> = {
  "demo-team": [
    { user_id: "demo-user", email: "demo@example.com", role: "owner" },
    { user_id: "demo-admin", email: "admin@example.com", role: "admin" },
    { user_id: "demo-member", email: "member@example.com", role: "member" },
  ],
  "field-notes": [
    { user_id: "demo-user", email: "demo@example.com", role: "member" },
    { user_id: "demo-owner", email: "owner@example.com", role: "owner" },
  ],
};
