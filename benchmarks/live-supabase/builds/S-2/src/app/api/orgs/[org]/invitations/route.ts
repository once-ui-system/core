import { createInvitation, invitationPath, listInvitations, revokeInvitation } from "@/lib/orgs/invitations";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** Open invitations — owner or admin only: who has been asked in is not every member's business. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await listInvitations(guard);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ invitations: result.invitations }, { status: 200 });
}

/**
 * Invite `{ email?, role }` (owners and admins; 403 for members). The response is the only place the link ever
 * appears — the database keeps its hash — so the caller shows or sends it now.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createInvitation(guard, body.email, body.role);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const url = new URL(invitationPath(result.token), request.url).toString();
  return NextResponse.json({ token: result.token, url, invitation: result.invitation }, { status: 201 });
}

/** Revoke `?id=`. */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Expected an id query parameter" }, { status: 400 });

  const result = await revokeInvitation(guard, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true }, { status: 200 });
}
