import { createOrganization, listUserOrganizations } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

/** The organizations the signed-in user belongs to, for the workspace switcher. */
export async function GET() {
  const result = await listUserOrganizations();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ organizations: result.organizations }, { status: 200 });
}

/** `{ "name": "…" }` (and optionally `"slug"`) → 201 `{ id, slug, name }`. The caller is its owner. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name : "";
  const slug = typeof body.slug === "string" && body.slug.length > 0 ? body.slug : null;

  const result = await createOrganization(name, slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { id, slug: createdSlug, name: createdName } = result.organization;
  return NextResponse.json({ id, slug: createdSlug, name: createdName }, { status: 201 });
}
