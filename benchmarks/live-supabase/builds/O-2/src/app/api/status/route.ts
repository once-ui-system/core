import { isSupabaseConfigured } from "../../../lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ supabase: isSupabaseConfigured() });
}
