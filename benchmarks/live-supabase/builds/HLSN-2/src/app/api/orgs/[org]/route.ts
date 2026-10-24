import { renameOrganization, requireOrg, requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** `{ id, slug, name, plan, role }`: role is the caller's. Any member may read it. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id, name, plan } = guard.org;
  return NextResponse.json({ id, slug: guard.org.slug, name, plan, role: guard.role }, { status: 200 });
}

/** Rename `{ "name": "…" }`. Owners and admins only. */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "Expected { name }" }, { status: 400 });
  }

  const result = await renameOrganization(guard, body.name);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { id, name, plan } = result.organization;
  return NextResponse.json(
    { id, slug: result.organization.slug, name, plan, role: guard.role },
    { status: 200 },
  );
}
