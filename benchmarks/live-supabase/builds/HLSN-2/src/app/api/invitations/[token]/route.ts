import { acceptInvitation, previewInvitation } from "@/lib/orgs/invitations";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/** The organization and role a live invitation grants. The caller must be signed in. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const result = await previewInvitation(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.preview, { status: 200 });
}

/** The signed-in user joins the organization with the invitation's role. */
export async function POST(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const result = await acceptInvitation(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ organization: result.organization }, { status: 200 });
}
