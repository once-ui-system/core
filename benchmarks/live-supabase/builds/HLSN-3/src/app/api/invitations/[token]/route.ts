import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api";
import { createAdminSupabase } from "@/lib/supabase/server";
import { FREE_MEMBER_LIMIT, type Role, isRole } from "@/lib/orgs/types";

type Params = { params: Promise<{ token: string }> };

/**
 * POST /api/invitations/{token}: the signed-in user joins the organization with
 * the invitation's role. Answers 410 for an expired link, 402 when the Free plan
 * is full. A user who is already a member keeps their current role.
 */
export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { token } = await params;

  const admin = createAdminSupabase();
  const { data: invitation, error: inviteError } = await admin
    .from("invitations")
    .select("organization_id, role, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (inviteError) return apiError(500, "internal_error", "Failed to load the invitation");
  if (!invitation || !isRole(invitation.role)) {
    return apiError(404, "not_found", "This invitation does not exist");
  }
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    return apiError(410, "expired", "This invitation has expired");
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, slug, name, plan")
    .eq("id", invitation.organization_id)
    .maybeSingle();
  if (orgError || !org) return apiError(404, "not_found", "This invitation does not exist");

  const { data: existing } = await admin
    .from("memberships")
    .select("role")
    .eq("organization_id", org.id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ slug: org.slug, name: org.name, role: existing.role });
  }

  if (org.plan === "free") {
    const { count } = await admin
      .from("memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("organization_id", org.id);
    if ((count ?? 0) >= FREE_MEMBER_LIMIT) {
      return apiError(402, "plan_limit", `The Free plan allows up to ${FREE_MEMBER_LIMIT} members`);
    }
  }

  const role: Role = invitation.role;
  const { error: joinError } = await admin
    .from("memberships")
    .insert({ organization_id: org.id, user_id: auth.userId, role });
  if (joinError && joinError.code !== "23505") {
    console.error("Joining an organization failed:", joinError);
    return apiError(500, "internal_error", "Failed to join the organization");
  }

  return NextResponse.json({ slug: org.slug, name: org.name, role });
}
