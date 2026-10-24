import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs/guard";

type Params = { params: Promise<{ org: string }> };

/** GET /api/orgs/{org}/members: [{ user_id, email, role }] for any member. */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId);
  if (!check.ok) return apiError(check.status, check.code, check.message);

  const { data: rows, error } = await check.admin
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("organization_id", check.org.id)
    .order("created_at", { ascending: true });
  if (error) return apiError(500, "internal_error", "Failed to load members");

  const ids = (rows ?? []).map((row) => row.user_id);
  const { data: profiles } = ids.length
    ? await check.admin.from("profiles").select("id, email").in("id", ids)
    : { data: [] as { id: string; email: string | null }[] };
  const emails = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return NextResponse.json(
    (rows ?? []).map((row) => ({
      user_id: row.user_id,
      email: emails.get(row.user_id) ?? null,
      role: row.role,
    })),
  );
}
