import { createOrganization, listUserOrganizations } from "@/lib/orgs/server";
import { slugWithSuffix, slugify } from "@/lib/orgs/slug";
import { randomBytes } from "node:crypto";
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
  const base = explicit ?? (slugify(name) || "workspace");

  // Without an explicit slug a taken one is not an error: the name is not
  // unique, so a short random suffix makes the address unique.
  let result = await createOrganization(name, base);
  for (let attempt = 0; !explicit && !result.ok && result.status === 409 && attempt < 5; attempt++) {
    result = await createOrganization(name, slugWithSuffix(base, randomBytes(3).toString("hex")));
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { id, slug, name: savedName } = result.organization;
  return NextResponse.json({ id, slug, name: savedName }, { status: 201 });
}
