import type { SupabaseClient } from "@supabase/supabase-js";
import { INVITE_TTL_DAYS, type InvitableRole, type Member, type Role, isRole } from "./types";

// Data operations. Each takes the caller's Supabase client, so row level security and the
// SQL functions still apply. Callers must check membership and role first.

export async function createOrganization(supabase: SupabaseClient, name: string) {
  const { data, error } = await supabase.rpc("create_organization", { p_name: name });
  if (error || !data) throw new Error(error?.message ?? "create_organization failed");
  return data as { id: string; slug: string; name: string; plan: string; role: Role };
}

export async function renameOrganization(supabase: SupabaseClient, orgId: string, name: string) {
  const { data, error } = await supabase
    .from("organizations")
    .update({ name })
    .eq("id", orgId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

export async function listMembers(supabase: SupabaseClient, orgId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at, profiles(email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  type Row = { user_id: string; role: string; profiles: { email: string } | { email: string }[] | null };
  return ((data ?? []) as unknown as Row[])
    .filter((row) => isRole(row.role))
    .map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return { user_id: row.user_id, email: profile?.email ?? "", role: row.role as Role };
    });
}

export async function countPendingInvitations(supabase: SupabaseClient, orgId: string): Promise<number> {
  const { count, error } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  if (error) return 0;
  return count ?? 0;
}

// Returns the random token for the new invitation. The token is the only secret in the link.
export async function createInvitation(
  supabase: SupabaseClient,
  input: { orgId: string; createdBy: string; email: string | null; role: InvitableRole; token: string },
) {
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      org_id: input.orgId,
      created_by: input.createdBy,
      email: input.email,
      role: input.role,
      token: input.token,
      expires_at: expiresAt,
    })
    .select("token")
    .single();
  if (error || !data) throw new Error(error?.message ?? "insert failed");
  return data.token as string;
}

export async function acceptInvitation(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error || !data) throw new InvitationError(error?.message ?? "accept failed");
  return data as { id: string; slug: string; name: string; plan: string; role: Role };
}

export class InvitationError extends Error {
  // Maps the messages raised by accept_invitation to an HTTP status.
  get status(): number {
    switch (this.message) {
      case "invalid_invitation":
        return 404;
      case "invitation_expired":
        return 410;
      case "invitation_email_mismatch":
        return 403;
      case "not_authenticated":
        return 401;
      default:
        return 500;
    }
  }
}
