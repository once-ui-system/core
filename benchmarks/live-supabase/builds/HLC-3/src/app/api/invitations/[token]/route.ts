import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { jsonError, statusForRpcError } from "@/lib/http";

type Params = { params: Promise<{ token: string }> };

// Joins the signed-in user to the invitation's organization with the invitation's role.
// Returns { id, slug, name, role }.
export async function POST(_request: Request, { params }: Params) {
  const { token } = await params;
  if (!isSupabaseConfigured()) return jsonError(503, "Supabase is not configured");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "Not signed in");

  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) return jsonError(statusForRpcError(error.message), error.message);
  return NextResponse.json(data, { status: 200 });
}
