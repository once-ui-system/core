import { isSupabaseConfigured } from "@/lib/env";
import { createAdminSupabase } from "@/lib/supabase/server";
import { DEMO_ORG, type Membership, type Plan, type Role } from "./types";

/** The organizations a user belongs to, oldest membership first. Demo mode has the demo organization. */
export async function listMemberships(userId: string | null): Promise<Membership[]> {
  if (!isSupabaseConfigured()) return [DEMO_ORG];
  if (!userId) return [];

  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("memberships")
    .select("role, created_at, organizations(id, slug, name, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Loading memberships failed:", error);
    return [];
  }

  const rows = (data ?? []) as unknown as {
    role: Role;
    organizations: { id: string; slug: string; name: string; plan: Plan } | null;
  }[];
  return rows.flatMap((row) =>
    row.organizations ? [{ ...row.organizations, role: row.role }] : [],
  );
}
