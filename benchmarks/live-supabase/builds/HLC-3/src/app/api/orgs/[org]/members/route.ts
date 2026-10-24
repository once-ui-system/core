import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/orgs/access";
import { listMembers } from "@/lib/orgs/service";
import { jsonError } from "@/lib/http";

type Params = { params: Promise<{ org: string }> };

// Members of the organization: [{ user_id, email, role }].
export async function GET(_request: Request, { params }: Params) {
  const { org: slug } = await params;
  const guard = await apiGuard(slug);
  if (!guard.ok) return guard.response;
  try {
    const members = await listMembers(guard.supabase, guard.org.id);
    return NextResponse.json(
      members.map(({ user_id, email, role }) => ({ user_id, email, role }))
    );
  } catch (error) {
    return jsonError(500, error instanceof Error ? error.message : "Could not load members");
  }
}
