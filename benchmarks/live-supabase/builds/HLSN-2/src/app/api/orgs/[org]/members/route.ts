import { leaveOrganization, listOrgMembers, removeOrgMember, requireOrg, requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** `[{ user_id, email, role }]`. Any member may see who else is in the organization. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await listOrgMembers(guard);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result.members, { status: 200 });
}

/**
 * Remove `?userId=<id>` (owners and admins), or leave with `?userId=me` (any
 * member, about themselves).
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Expected a userId query parameter" }, { status: 400 });
  }

  if (userId === "me") {
    const member = await requireOrg(slug);
    if (!member.ok) return NextResponse.json({ error: member.error }, { status: member.status });
    const left = await leaveOrganization(member);
    if (!left.ok) return NextResponse.json({ error: left.error }, { status: left.status });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await removeOrgMember(guard, userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true }, { status: 200 });
}
