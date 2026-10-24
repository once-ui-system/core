import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG, DEMO_USER } from "./demo";
import type { Org, OrgWithRole, Role } from "./types";
import { isRole } from "./types";

export type CurrentUser = { id: string; email: string };

// The signed-in user, or null. In demo mode there is always a demo user.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return DEMO_USER;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

type MembershipRow = { role: string; organizations: Org | Org[] | null };

function toOrg(row: MembershipRow): OrgWithRole | null {
  const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  if (!org || !isRole(row.role)) return null;
  return { id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: row.role as Role };
}

// Every organization the signed-in user belongs to, oldest first.
export async function listMyOrgs(): Promise<OrgWithRole[]> {
  if (!isSupabaseConfigured()) return [DEMO_ORG];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as MembershipRow[]).map(toOrg).filter((o): o is OrgWithRole => o !== null);
}

// The organization with this slug, if the signed-in user is a member. Null otherwise.
export async function getMyOrg(slug: string): Promise<OrgWithRole | null> {
  if (!isSupabaseConfigured()) return slug === DEMO_ORG.slug ? DEMO_ORG : null;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("memberships")
    .select("role, organizations!inner(id, slug, name, plan)")
    .eq("user_id", auth.user.id)
    .eq("organizations.slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return toOrg(data as unknown as MembershipRow);
}
