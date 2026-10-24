import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { fetchRole, requireUserAndService } from "@/lib/sb/service";
import { ApiError, errorResponse, handleApiError } from "@/lib/errors";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

export async function GET() {
  // Demo mode: creating the SSR client below throws without env vars, so
  // answer 503 up front instead of a misleading 500.
  if (!isSupabaseConfigured() || !supabaseSecretKey()) {
    return errorResponse(503, "not_configured", "Supabase is not configured. See .env.example.");
  }
  try {
    const { user, serviceClient } = await requireUserAndService();

    // Ownership is enforced by filtering on the authenticated user's id.
    const { data, error } = await serviceClient
      .from("profiles")
      .select("avatar_url, username, bio")
      .eq("id", user.id)
      .single();

    if (error) {
      throw new ApiError(500, "profile_fetch_failed", `Failed to fetch profile: ${error.message}`);
    }
    if (!data) {
      throw new ApiError(404, "profile_not_found", "Profile not found");
    }

    const { roleId, roleRank } = await fetchRole(serviceClient, user.id);

    return NextResponse.json(
      { profile: data, email: user.email ?? null, roleId, roleRank },
      { status: 200 },
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured() || !supabaseSecretKey()) {
    return errorResponse(503, "not_configured", "Supabase is not configured. See .env.example.");
  }
  try {
    const { user, serviceClient } = await requireUserAndService();

    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (typeof body.username === "string") updates.username = body.username.trim();
    if (typeof body.bio === "string") updates.bio = body.bio.trim();

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "invalid_fields", "No valid fields provided. Allowed: username, bio");
    }

    const { data, error } = await serviceClient
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("avatar_url, username, bio")
      .single();

    if (error) {
      throw new ApiError(500, "profile_update_failed", `Failed to update profile: ${error.message}`);
    }

    const { roleId, roleRank } = await fetchRole(serviceClient, user.id);

    return NextResponse.json(
      { profile: data, email: user.email ?? null, roleId, roleRank },
      { status: 200 },
    );
  } catch (err) {
    return handleApiError(err);
  }
}
