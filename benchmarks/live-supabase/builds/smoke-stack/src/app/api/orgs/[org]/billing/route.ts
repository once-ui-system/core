import { getOrgBilling } from "@/lib/billing/server";
import { requireOrg } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** The organization's plan. Any member may see what their organization is on. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await getOrgBilling(guard);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // The Stripe customer id is for server code; members only need to know one exists.
  const { customerId: _customerId, ...billing } = result.billing;
  return NextResponse.json(billing, { status: 200 });
}
