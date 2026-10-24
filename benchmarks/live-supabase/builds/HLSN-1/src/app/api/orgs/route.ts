import { NextResponse } from "next/server";
import { apiError, guarded, readJsonObject } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { getCurrentUser } from "@/lib/orgs/guard";
import { createOrganization } from "@/lib/orgs/data";
import { parseName } from "@/lib/orgs/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Creates an organization; the signed-in user becomes its owner. */
export async function POST(request: Request) {
  return guarded("POST /api/orgs", async () => {
    if (!isSupabaseConfigured()) return apiError(503, "not_configured", "Supabase is not configured.");

    const user = await getCurrentUser();
    if (!user) return apiError(401, "unauthorized", "Sign in first.");

    const body = await readJsonObject(request);
    const name = parseName(body?.name);
    if (!name) return apiError(400, "invalid_name", "Give the organization a name of 1 to 80 characters.");

    const org = await createOrganization(name, user);
    return NextResponse.json({ id: org.id, slug: org.slug, name: org.name }, { status: 201 });
  });
}
