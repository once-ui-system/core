import { createInvitation, invitationPath } from "@/lib/orgs/invitations";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** Invite by link. Owners and admins only; members get 403. */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createInvitation(guard, body.email, body.role);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const url = new URL(invitationPath(result.token), origin).toString();
  return NextResponse.json({ token: result.token, url }, { status: 201 });
}
