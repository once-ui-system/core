export const DEMO_ORG = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "demo",
  name: "Demo Team",
  plan: "free" as "free" | "team",
  role: "owner" as Role,
};

export const DEMO_USER = { id: "demo-user", email: "you@acme-notes.example", name: "Demo User" };

export const DEMO_MEMBERS = [
  { user_id: "demo-user", email: "you@acme-notes.example", role: "owner" as Role },
  { user_id: "demo-2", email: "river@acme-notes.example", role: "admin" as Role },
  { user_id: "demo-3", email: "sam@acme-notes.example", role: "member" as Role },
];

export type Role = "owner" | "admin" | "member";
