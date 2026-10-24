import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Member } from "./types";

export async function listMembers(supabase: SupabaseClient, orgId: string): Promise<Member[]> {
  const { data: rows, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const ids = (rows ?? []).map((r) => r.user_id as string);
  const emails = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", ids);
    if (profileError) throw profileError;
    for (const p of profiles ?? []) emails.set(p.id as string, p.email as string);
  }

  return (rows ?? []).map((r) => ({
    user_id: r.user_id as string,
    email: emails.get(r.user_id as string) ?? "",
    role: r.role as Member["role"],
  }));
}

export async function countActiveInvitations(supabase: SupabaseClient, orgId: string): Promise<number> {
  const { count, error } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gt("expires_at", new Date().toISOString());
  if (error) throw error;
  return count ?? 0;
}
