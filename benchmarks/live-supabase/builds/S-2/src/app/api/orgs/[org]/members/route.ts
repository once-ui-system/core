import { parseTableQuery } from "@/lib/data/query";
import {
  leaveOrganization,
  listOrgMembers,
  listOrgMembersPage,
  removeOrgMember,
  requireOrg,
  requireOrgAdmin,
  setOrgMemberRole,
} from "@/lib/orgs/server";
import { MEMBERS_QUERY_SPEC, type OrgRole } from "@/lib/orgs/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

function readMemberRole(value: unknown): OrgRole | null {
  return value === "owner" || value === "admin" || value === "member" ? value : null;
}

/**
 * One page of the organization's members. Any member may see who else is in
 * it. Answers DataTable's server mode: `?page&perPage&sort&dir&q&role`, parsed
 * against MEMBERS_QUERY_SPEC so only the columns it lists can sort or filter.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const search = new URL(request.url).searchParams;

  // The plain answer is every member as `{ user_id, email, role }`. The
  // members table asks for a page with `?page` / `perPage`, and gets one.
  if (!search.has("page") && !search.has("perPage")) {
    const all = await listOrgMembers(guard);
    if (!all.ok) return NextResponse.json({ error: all.error }, { status: all.status });
    return NextResponse.json(
      all.members.map(({ user_id, email, role }) => ({ user_id, email, role })),
      { status: 200 },
    );
  }

  const query = parseTableQuery(search, MEMBERS_QUERY_SPEC);
  const result = await listOrgMembersPage(guard, query);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result.page, { status: 200 });
}

/** Change a member's role — owner or admin only. */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const userId = typeof body.userId === "string" ? body.userId : "";
  const role = readMemberRole(body.role);

  if (!userId || !role) {
    return NextResponse.json(
      { error: 'Expected { userId, role } with role one of "owner", "admin" or "member"' },
      { status: 400 },
    );
  }

  const result = await setOrgMemberRole(guard, userId, role);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ member: result.member }, { status: 200 });
}

/**
 * Remove a member — owner or admin only — or, with `?userId=me`, leave. Leaving
 * is any member's right about themselves, so it takes the member guard, not
 * the admin one.
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
