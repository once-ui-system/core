import { NextResponse } from "next/server";
import { apiError, guarded, readJsonObject } from "@/lib/api";
import { apiAccess } from "@/lib/orgs/guard";
import { renameOrganization } from "@/lib/orgs/data";
import { parseName } from "@/lib/orgs/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** The organization, with the caller's role. Any member may read it. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  return guarded("GET /api/orgs/[org]", async () => {
    const access = await apiAccess(slug, "member");
    if (!access.ok) return access.response;

    const { id, name, plan } = access.org;
    return NextResponse.json({ id, slug: access.org.slug, name, plan, role: access.role }, { status: 200 });
  });
}

/** Renames the organization. Owners and admins only. */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;
  return guarded("PATCH /api/orgs/[org]", async () => {
    const access = await apiAccess(slug, "manage");
    if (!access.ok) return access.response;

    const body = await readJsonObject(request);
    const name = parseName(body?.name);
    if (!name) return apiError(400, "invalid_name", "Give the organization a name of 1 to 80 characters.");

    const org = await renameOrganization(access.org.id, name);
    return NextResponse.json(
      { id: org.id, slug: org.slug, name: org.name, plan: org.plan, role: access.role },
      { status: 200 },
    );
  });
}
