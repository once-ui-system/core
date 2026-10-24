import { NextResponse } from "next/server";
import { guarded } from "@/lib/api";
import { apiAccess } from "@/lib/orgs/guard";
import { listMembers } from "@/lib/orgs/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** The organization's members: [{ user_id, email, role }]. Any member may read it. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  return guarded("GET /api/orgs/[org]/members", async () => {
    const access = await apiAccess(slug, "member");
    if (!access.ok) return access.response;

    const members = await listMembers(access.org.id);
    return NextResponse.json(
      members.map((m) => ({ user_id: m.user_id, email: m.email, role: m.role })),
      { status: 200 },
    );
  });
}
