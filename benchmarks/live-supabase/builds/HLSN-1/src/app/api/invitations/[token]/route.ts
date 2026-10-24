import { NextResponse } from "next/server";
import { apiError, guarded } from "@/lib/api";
import { getCurrentUser } from "@/lib/orgs/guard";
import { addMember, findInvitationByHash } from "@/lib/orgs/data";
import { hashInviteToken } from "@/lib/orgs/tokens";
import { isSupabaseConfigured } from "@/lib/sb/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * Joins the signed-in user to the invitation's organization with the
 * invitation's role. Answers 404 for an unknown token and 410 once it has
 * expired. Joining again keeps the membership as it is.
 */
export async function POST(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  return guarded("POST /api/invitations/[token]", async () => {
    if (!isSupabaseConfigured()) return apiError(503, "not_configured", "Supabase is not configured.");

    const user = await getCurrentUser();
    if (!user) return apiError(401, "unauthorized", "Sign in first.");

    const invitation = await findInvitationByHash(hashInviteToken(token));
    if (!invitation) return apiError(404, "not_found", "This invitation does not exist.");
    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      return apiError(410, "expired", "This invitation has expired.");
    }

    const role = await addMember({
      orgId: invitation.organization.id,
      userId: user.id,
      email: user.email ?? null,
      role: invitation.role,
    });

    return NextResponse.json(
      { id: invitation.organization.id, slug: invitation.organization.slug, name: invitation.organization.name, role },
      { status: 200 },
    );
  });
}
