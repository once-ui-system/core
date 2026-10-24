import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/orgs/access";
import { INVITATION_TTL_MS } from "@/lib/orgs/types";
import { jsonError, readJsonObject } from "@/lib/http";

type Params = { params: Promise<{ org: string }> };

// Creates an invitation link that expires after 7 days. Owners and admins only.
// Body: { "email"?: string, "role": "member" | "admin" }.
export async function POST(request: Request, { params }: Params) {
  const { org: slug } = await params;
  const guard = await apiGuard(slug, { manage: true });
  if (!guard.ok) return guard.response;

  const body = await readJsonObject(request);
  if (!body) return jsonError(400, "Body must be a JSON object");

  const role = body.role;
  if (role !== "member" && role !== "admin") return jsonError(400, "role must be member or admin");

  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string") return jsonError(400, "email must be a string");
    const trimmed = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return jsonError(400, "email is not valid");
    email = trimmed;
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS).toISOString();
  const { error } = await guard.supabase.from("invitations").insert({
    org_id: guard.org.id,
    token,
    email,
    role,
    created_by: guard.user.id,
    expires_at: expiresAt,
  });
  if (error) {
    return jsonError(error.code === "42501" ? 403 : 500, error.message);
  }

  const url = `${new URL(request.url).origin}/invite/${token}`;
  return NextResponse.json({ token, url, expires_at: expiresAt }, { status: 201 });
}
