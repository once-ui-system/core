import { createOrganization, listUserOrganizations } from "@/lib/orgs/server";
import { slugify } from "@/lib/orgs/slug";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

/**
 * The organizations the signed-in user belongs to — what the workspace
 * switcher reads on every product request.
 *
 * This is also the request that lazily creates the user's personal
 * organization, so no user is ever tenant-less after their first visit.
 */
export async function GET() {
  const result = await listUserOrganizations();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ organizations: result.organizations }, { status: 200 });
}

/** Create an organization; the caller becomes its owner. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name : "";
  const explicit = typeof body.slug === "string" && body.slug.length > 0 ? body.slug : null;
  // A slug derived from the name gets a suffix on collision; one the caller
  // chose is theirs to resolve (409).
  const slug = explicit ?? (slugify(name) || "org");

  const result = await createOrganization(name, slug, { suffixOnCollision: explicit === null });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { id, slug: createdSlug, name: createdName } = result.organization;
  return NextResponse.json({ id, slug: createdSlug, name: createdName }, { status: 201 });
}
