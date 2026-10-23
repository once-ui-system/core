import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./env";
import { currentUser } from "./supabase/server";
import { type OrgWithRole, userOrgs } from "./orgs";

export const DEMO_SLUG = "demo";

export const demoOrg: OrgWithRole = {
  id: "00000000-0000-0000-0000-000000000000",
  slug: DEMO_SLUG,
  name: "Demo workspace",
  plan: "free",
  created_at: "2026-10-01T00:00:00.000Z",
  role: "owner",
};

export const demoMembers = [
  { user_id: "demo-1", email: "you@acme-notes.example", role: "owner" as const, created_at: demoOrg.created_at },
  { user_id: "demo-2", email: "sam@acme-notes.example", role: "admin" as const, created_at: demoOrg.created_at },
  { user_id: "demo-3", email: "robin@acme-notes.example", role: "member" as const, created_at: demoOrg.created_at },
];

/** The signed-in user (null in demo mode); redirects to /auth when signed out. */
export async function requireSession() {
  if (!isSupabaseConfigured()) return { demo: true as const, user: null, email: "you@acme-notes.example" };
  const user = await currentUser();
  if (!user) redirect("/auth");
  return { demo: false as const, user, email: user.email ?? "" };
}

export async function orgsFor(session: Awaited<ReturnType<typeof requireSession>>) {
  if (session.demo || !session.user) return [demoOrg];
  return userOrgs(session.user.id);
}
