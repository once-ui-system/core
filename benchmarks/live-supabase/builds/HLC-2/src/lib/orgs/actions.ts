import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { makeSlug, randomToken } from "@/lib/orgs/slug";
import type { Org, Role } from "@/lib/orgs/types";

export class OrgError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Creates an organization for the caller, who becomes its owner. Retries on a slug clash. */
export async function createOrganization(userId: string, rawName: string): Promise<Org> {
  const name = rawName.trim();
  if (name.length < 1 || name.length > 80) throw new OrgError("name must be 1 to 80 characters", 400);
  if (!isSupabaseConfigured()) throw new OrgError("Supabase is not configured", 503);
  const supabase = await createSupabaseServerClient();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.rpc("create_organization", {
      p_name: name,
      p_slug: makeSlug(name),
    });
    if (!error && data) return data as Org;
    if (error?.code !== "23505") throw new OrgError(error?.message ?? "could not create", 500);
  }
  throw new OrgError("could not pick a free slug, try again", 503);
}

/** Creates an invitation link. Owners and admins only. */
export async function createInvitation(
  userId: string,
  org: Org,
  role: Role,
  caller: Role,
  email: string | null,
): Promise<{ token: string; expires_at: string }> {
  if (caller !== "owner" && caller !== "admin") throw new OrgError("only owners and admins invite people", 403);
  if (role === "owner") throw new OrgError("role must be member or admin", 400);
  if (!isSupabaseConfigured()) throw new OrgError("Supabase is not configured", 503);
  const supabase = await createSupabaseServerClient();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("invitations").insert({
    org_id: org.id,
    token,
    email,
    role,
    created_by: userId,
    expires_at: expiresAt,
  });
  if (error) throw new OrgError(error.message, 500);
  return { token, expires_at: expiresAt };
}

/** Renames an organization. Owners and admins only. */
export async function renameOrganization(org: Org, caller: Role, rawName: string): Promise<void> {
  if (caller !== "owner" && caller !== "admin") throw new OrgError("only owners and admins rename", 403);
  const name = rawName.trim();
  if (name.length < 1 || name.length > 80) throw new OrgError("name must be 1 to 80 characters", 400);
  if (!isSupabaseConfigured()) throw new OrgError("Supabase is not configured", 503);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("organizations").update({ name }).eq("id", org.id);
  if (error) throw new OrgError(error.message, 500);
}

/** Joins the caller to the organization behind an invitation token. */
export async function acceptInvitation(token: string): Promise<{ id: string; slug: string; name: string; role: Role }> {
  if (!isSupabaseConfigured()) throw new OrgError("Supabase is not configured", 503);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) {
    if (error.code === "P0002") throw new OrgError("invitation not found", 404);
    if (error.code === "22023") throw new OrgError("invitation expired", 410);
    throw new OrgError(error.message, 500);
  }
  return data as { id: string; slug: string; name: string; role: Role };
}
