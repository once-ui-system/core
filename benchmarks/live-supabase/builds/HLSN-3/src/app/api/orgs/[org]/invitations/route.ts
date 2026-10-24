import { NextResponse } from "next/server";
import { apiError, readJsonObject, requireApiUser } from "@/lib/api";
import { checkOrgAccess } from "@/lib/orgs/guard";
import { INVITE_TTL_DAYS } from "@/lib/orgs/types";
import { makeInviteToken } from "@/lib/orgs/slug";

type Params = { params: Promise<{ org: string }> };

/** GET /api/orgs/{org}/invitations: the pending invitation links. Owners and admins only. */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId, "admin");
  if (!check.ok) return apiError(check.status, check.code, check.message);

  const { data, error } = await check.admin
    .from("invitations")
    .select("token, email, role, expires_at")
    .eq("organization_id", check.org.id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) return apiError(500, "internal_error", "Failed to load invitations");
  return NextResponse.json(data ?? []);
}

/**
 * POST /api/orgs/{org}/invitations with { "email"?, "role": "member" | "admin" }:
 * creates a link that expires after seven days. Owners and admins only.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { org: slug } = await params;

  const check = await checkOrgAccess(slug, auth.userId, "admin");
  if (!check.ok) return apiError(check.status, check.code, check.message);

  const body = await readJsonObject(request);
  const role = body?.role;
  if (role !== "member" && role !== "admin") {
    return apiError(400, "invalid_role", 'Role must be "member" or "admin"');
  }
  const email = typeof body?.email === "string" && body.email.trim() ? body.email.trim() : null;
  if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(400, "invalid_email", "Enter a valid email address");
  }

  const token = makeInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000).toISOString();
  const { error } = await check.admin.from("invitations").insert({
    organization_id: check.org.id,
    token,
    email,
    role,
    created_by: auth.userId,
    expires_at: expiresAt,
  });
  if (error) {
    console.error("Creating an invitation failed:", error);
    return apiError(500, "internal_error", "Failed to create the invitation");
  }

  const url = new URL(`/invite/${token}`, request.url).toString();
  return NextResponse.json({ token, url }, { status: 201 });
}
