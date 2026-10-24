import { requireOrg } from "@/lib/orgs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ org: string }> };

/** `{ "plan" }`: the organization's plan. Any member may read it. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { org: slug } = await params;

  const guard = await requireOrg(slug);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  return NextResponse.json({ plan: guard.org.plan }, { status: 200 });
}
