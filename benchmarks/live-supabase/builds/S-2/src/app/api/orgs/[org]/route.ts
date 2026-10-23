import {
  deleteOrganization,
  renameOrganization,
  requireOrg,
  requireOrgAdmin,
  requireOrgOwner,
} from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/**
 * One organization, as the member asking for it sees it.
 *
 * Note the shape every org-scoped handler in this app takes: resolve the
 * slug through a guard, hand back on failure, and from then on use
 * `guard.org.id` — never the slug the request carried — for anything that
 * touches the database.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id, slug: orgSlug, name, plan } = guard.org;
  return NextResponse.json({ id, slug: orgSlug, name, plan, role: guard.role }, { status: 200 });
}

/**
 * Rename an organization. A stricter gate than GET: reading and
 * administering are different questions, so this asks the admin one.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "No valid fields provided. Allowed: name" }, { status: 400 });
  }

  const result = await renameOrganization(guard, body.name);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(
    { organization: { ...result.organization, role: guard.role } },
    { status: 200 },
  );
}

/**
 * Delete an organization — owner only, never a personal one, and never while
 * something that must outlive it (a live subscription) still points at it.
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgOwner(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await deleteOrganization(guard);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true }, { status: 200 });
}
