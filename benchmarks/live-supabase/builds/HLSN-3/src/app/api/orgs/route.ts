import { NextResponse } from "next/server";
import { apiError, readJsonObject, requireApiUser } from "@/lib/api";
import { createAdminSupabase } from "@/lib/supabase/server";
import { makeSlug } from "@/lib/orgs/slug";

/** POST /api/orgs: create an organization; the caller becomes its owner. */
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) {
    return apiError(400, "invalid_name", "Name must be between 1 and 80 characters");
  }

  const admin = createAdminSupabase();
  let org: { id: string; slug: string; name: string } | null = null;
  for (let attempt = 0; attempt < 3 && !org; attempt++) {
    const { data, error } = await admin
      .from("organizations")
      .insert({ name, slug: makeSlug(name), created_by: auth.userId })
      .select("id, slug, name")
      .single();
    if (data) org = data;
    else if (error?.code !== "23505") {
      console.error("Creating an organization failed:", error);
      return apiError(500, "internal_error", "Failed to create the organization");
    }
  }
  if (!org) return apiError(500, "internal_error", "Failed to create the organization");

  const { error: memberError } = await admin
    .from("memberships")
    .insert({ organization_id: org.id, user_id: auth.userId, role: "owner" });
  if (memberError) {
    await admin.from("organizations").delete().eq("id", org.id);
    console.error("Adding the owner failed:", memberError);
    return apiError(500, "internal_error", "Failed to create the organization");
  }

  return NextResponse.json({ id: org.id, slug: org.slug, name: org.name }, { status: 201 });
}
