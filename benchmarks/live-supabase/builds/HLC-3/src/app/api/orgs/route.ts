import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { jsonError, readJsonObject, statusForRpcError } from "@/lib/http";

// Creates an organization; the caller becomes its owner.
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return jsonError(503, "Supabase is not configured");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "Not signed in");

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) return jsonError(400, "name must be 1 to 80 characters");

  const { data, error } = await supabase.rpc("create_organization", { p_name: name });
  if (error) return jsonError(statusForRpcError(error.message), error.message);

  const org = data as { id: string; slug: string; name: string };
  return NextResponse.json({ id: org.id, slug: org.slug, name: org.name }, { status: 201 });
}
