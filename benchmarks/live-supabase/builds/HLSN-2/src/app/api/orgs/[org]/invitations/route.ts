import { createInvitation, listInvitations, revokeInvitation } from "@/lib/orgs/invitations";
import { invitationPathFor } from "@/lib/orgs/types";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** Open invitations. Owners and admins only. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await listInvitations(guard);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ invitations: result.invitations }, { status: 200 });
}

/**
 * `{ "email"?: "…", "role": "member" | "admin" }` → 201 `{ token, url }`. The
 * token is returned here and nowhere else. Owners and admins only.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createInvitation(guard, body.email, body.role);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const url = new URL(invitationPathFor(result.token), request.url).toString();
  return NextResponse.json({ token: result.token, url }, { status: 201 });
}

/** Revoke `?id=<invitation id>`. Owners and admins only. */
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
