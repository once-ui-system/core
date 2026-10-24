import { randomBytes } from "node:crypto";
import { apiOrg, json, readJson } from "@/lib/api";
import { createInvitation } from "@/lib/orgs/data";
import { canManage, isInvitableRole } from "@/lib/orgs/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await apiOrg(slug);
  if (ctx instanceof Response) return ctx;
  if (!canManage(ctx.org.role)) return json({ error: "Only owners and admins can invite" }, 403);

  const body = await readJson(request);
  if (!body || !isInvitableRole(body.role)) {
    return json({ error: "role must be \"member\" or \"admin\"" }, 400);
  }
  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || body.email.length > 320 || !EMAIL.test(body.email)) {
      return json({ error: "email is not valid" }, 400);
    }
    email = body.email.trim().toLowerCase();
  }

  // 32 random bytes, URL-safe. The token alone identifies the invitation.
  const token = randomBytes(32).toString("base64url");
  try {
    await createInvitation(ctx.supabase, {
      orgId: ctx.org.id,
      createdBy: ctx.userId,
      email,
      role: body.role,
      token,
    });
  } catch {
    return json({ error: "Could not create the invitation" }, 500);
  }
  const url = new URL(`/invite/${token}`, request.url).toString();
  return json({ token, url }, 201);
}
