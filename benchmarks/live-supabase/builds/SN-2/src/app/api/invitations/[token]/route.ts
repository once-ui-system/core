import { acceptInvitation, previewInvitation } from "@/lib/orgs/invitations";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * What an invitation is for, for the signed-in visitor holding its link. No
 * org guard here: the caller is by definition not a member yet. The token is
 * the capability, and the invitee's verified email is the second factor.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const result = await previewInvitation(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.preview, { status: 200 });
}

/** Accept it: join the organization with the invited role. */
export async function POST(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const result = await acceptInvitation(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, organization: result.organization }, { status: 200 });
}
