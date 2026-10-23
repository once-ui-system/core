import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "./lib/env";
import { updateSession } from "./lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();
  return updateSession(request);
}

export const config = { matcher: ["/app/:path*"] };
