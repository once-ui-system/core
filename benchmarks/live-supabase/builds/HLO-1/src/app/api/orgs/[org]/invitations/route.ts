import { headers } from "next/headers";
import { getCurrentUser, originOf } from "@/lib/auth";
import { apiError, json, readJson } from "@/lib/api";
import { checkOrgAccess, createInvitation } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Context = { params: Promise<{ org: string }> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: Context) {
  if (!isSupabaseConfigured()) return apiError(503, "Supabase is not configured.");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in first.");

  const { org } = await params;
  const body = await readJson(request);
  if (!body) return apiError(400, "Send a JSON body.");

  const role = body.role;
  if (role !== "member" && role !== "admin") return apiError(400, 'role must be "member" or "admin".');

  let email: string | null = null;
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    if (typeof body.email !== "string" || !EMAIL.test(body.email.trim())) return apiError(400, "email is not valid.");
    email = body.email.trim().toLowerCase();
  }

  const access = await checkOrgAccess(org, user.id, true);
  if (!access.ok) {
    return apiError(access.status, access.status === 404 ? "Not found." : "Only owners and admins can invite people.");
  }

  const { token } = await createInvitation(access.access, user.id, role, email);
  const origin = originOf(await headers());
  return json({ token, url: `${origin}/invite/${token}` }, 201);
}
