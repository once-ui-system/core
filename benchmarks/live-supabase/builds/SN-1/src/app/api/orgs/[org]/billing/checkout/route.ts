import { startCheckout } from "@/lib/billing/checkout";
import { requireOrgAdmin } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** Start a Stripe Checkout session for the Team plan. Owners and admins only. */
export async function POST(request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrgAdmin(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await startCheckout(guard, new URL(request.url).origin);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ url: result.url }, { status: 200 });
}
