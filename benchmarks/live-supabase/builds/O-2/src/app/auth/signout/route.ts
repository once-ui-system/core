import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "../../../lib/env";
import { sessionClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await sessionClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/auth", request.url), 303);
}
