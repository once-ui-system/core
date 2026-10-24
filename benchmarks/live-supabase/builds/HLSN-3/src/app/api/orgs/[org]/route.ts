import { apiError, readJsonObject, requireApiUser } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs/guard";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ org: string }> };

/** GET /api/orgs/{org}: the organization and the caller's role in it. */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId);
  if (!check.ok) return apiError(check.status, check.code, check.message);
  const { id, name, plan, role } = check.org;
  return NextResponse.json({ id, slug: check.org.slug, name, plan, role });
}

/** PATCH /api/orgs/{org} with { "name" }: rename the organization. Owners and admins only. */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId, "admin");
  if (!check.ok) return apiError(check.status, check.code, check.message);

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) {
    return apiError(400, "invalid_name", "Name must be between 1 and 80 characters");
  }

  const { data, error } = await check.admin
    .from("organizations")
    .update({ name })
    .eq("id", check.org.id)
    .select("id, slug, name, plan")
    .single();
  if (error || !data) return apiError(500, "internal_error", "Failed to rename the organization");
  return NextResponse.json({ ...data, role: check.org.role });
}
