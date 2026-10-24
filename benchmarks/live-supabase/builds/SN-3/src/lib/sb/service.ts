import { createClient as createServiceClient } from "@supabase/supabase-js";
import { supabaseSecretKey } from "./config";
import { createClient as createServerSupabase } from "@/lib/sb/server";
import { ApiError } from "@/lib/errors";

/**
 * Server-side helpers for API routes: resolve the signed-in user from auth
 * cookies, then act through a service-role client (RLS is enabled with no
 * member policies — ownership is enforced here by filtering on the user id).
 */

/** Resolves the signed-in user and a service-role client, or throws ApiError. */
export async function requireUserAndService() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new ApiError(401, "auth_failed", `Failed to resolve current user: ${userError.message}`);
  }
  if (!user) {
    throw new ApiError(401, "unauthorized", "Unauthorized");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = supabaseSecretKey();
  if (!url || !serviceRoleKey) {
    throw new ApiError(503, "not_configured", "Supabase is not configured. See .env.example.");
  }

  // Don't cache this client in a module global — create per request.
  const serviceClient = createServiceClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { user, serviceClient };
}

export type ServiceClient = Awaited<ReturnType<typeof requireUserAndService>>["serviceClient"];

/** Fetches the user's global role id and rank; role errors never block the profile. */
export async function fetchRole(serviceClient: ServiceClient, userId: string) {
  const { data: roleRow, error: roleError } = await serviceClient
    .from("user_global_roles")
    .select("role_id")
    .eq("user_id", userId)
    .maybeSingle();

  const roleId = roleError ? null : (roleRow?.role_id ?? null);

  let roleRank: number | null = null;
  if (roleId) {
    const { data: rolesRow, error: rolesErr } = await serviceClient
      .from("roles")
      .select("rank")
      .eq("id", roleId)
      .maybeSingle();
    roleRank = rolesErr ? null : (rolesRow?.rank ?? null);
  }

  return { roleId, roleRank };
}
