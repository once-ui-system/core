import { NextResponse } from "next/server";
import { listMembers, requireOrg } from "@/lib/orgs";

export async function GET(_req: Request, ctx: { params: Promise<{ org: string }> }) {
  const g = await requireOrg((await ctx.params).org);
  if (!g.ok) return g.response;
  return NextResponse.json(await listMembers(g.org.id));
}
