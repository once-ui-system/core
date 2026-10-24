import type { MemberRow, OrgRow } from "./types";

/**
 * Demo mode (no Supabase configured): one sample organization and sample
 * members, so every signed-in page renders. Nothing here is stored.
 */
export const DEMO_ORG: OrgRow = {
  id: "00000000-0000-4000-8000-000000000000",
  slug: "demo",
  name: "Demo workspace",
  plan: "free",
};

export const DEMO_MEMBERS: MemberRow[] = [
  { user_id: "demo-owner", email: "owner@example.com", role: "owner", created_at: "2026-10-01T00:00:00Z" },
  { user_id: "demo-admin", email: "admin@example.com", role: "admin", created_at: "2026-10-02T00:00:00Z" },
  { user_id: "demo-member", email: "member@example.com", role: "member", created_at: "2026-10-03T00:00:00Z" },
];

export const DEMO_PENDING_INVITATIONS = 1;
