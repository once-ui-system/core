import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Member, Org, OrgAccess, Role } from "@/lib/orgs/types";

// Every query here runs with the signed-in user's session, so RLS limits rows to
// organizations the user belongs to. The membership check below is still explicit.

const DEMO_ORG_NAME = "Demo workspace";

function demoAccess(slug: string): OrgAccess {
  return { org: { id: "demo-org", slug, name: DEMO_ORG_NAME, plan: "free" }, role: "owner" };
}

/** The organization with the caller's role, or null when the caller is not a member (or it does not exist). */
export async function getOrgAccess(userId: string, slug: string): Promise<OrgAccess | null> {
  if (!isSupabaseConfigured()) return demoAccess(slug);
  const supabase = await createSupabaseServerClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("slug", slug)
    .maybeSingle();
  if (!org) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) return null;
  return { org: org as Org, role: membership.role as Role };
}

/** Every organization the caller belongs to, with the caller's role, oldest first. */
export async function listMyOrgs(userId: string): Promise<OrgAccess[]> {
  if (!isSupabaseConfigured()) return [demoAccess("demo")];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("memberships")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).flatMap((row) => {
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    if (!org) return [];
    return [{ org: org as Org, role: row.role as Role }];
  });
}

export async function listMembers(orgId: string): Promise<Member[]> {
  if (!isSupabaseConfigured()) {
    return [
      { user_id: "demo-owner", email: "owner@acme-notes.example", role: "owner" },
      { user_id: "demo-member", email: "member@acme-notes.example", role: "member" },
    ];
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("org_members", { p_org: orgId });
  if (error) throw new Error(error.message);
  return (data ?? []) as Member[];
}

export async function countOpenInvitations(orgId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}
