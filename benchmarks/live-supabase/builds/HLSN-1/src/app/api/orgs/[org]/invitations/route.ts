import { NextResponse } from "next/server";
import { apiError, guarded, readJsonObject } from "@/lib/api";
import { apiAccess } from "@/lib/orgs/guard";
import { insertInvitation } from "@/lib/orgs/data";
import { INVITE_TTL_MS, hashInviteToken, newInviteToken } from "@/lib/orgs/tokens";
import { parseInvitableRole, parseInviteEmail } from "@/lib/orgs/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/**
 * Creates an invitation link that expires after seven days. The token is
 * returned once; only its hash is stored. Owners and admins only.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  return guarded("POST /api/orgs/[org]/invitations", async () => {
    const access = await apiAccess(slug, "manage");
    if (!access.ok) return access.response;

    const body = await readJsonObject(request);
    const role = parseInvitableRole(body?.role);
    if (!role) return apiError(400, "invalid_role", 'role must be "member" or "admin".');

    const email = parseInviteEmail(body?.email);
    if (email === false) return apiError(400, "invalid_email", "email is not a valid address.");

    const token = newInviteToken();
    await insertInvitation({
      orgId: access.org.id,
      email,
      role,
      tokenHash: hashInviteToken(token),
      invitedBy: access.user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({ token, url: `${origin}/invite/${token}` }, { status: 201 });
  });
}
