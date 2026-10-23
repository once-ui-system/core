import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireMembership, requireUser } from "@/lib/orgs/server";

export function GET(_req: Request, ctx: RouteContext<"/api/orgs/[org]">) {
  return handle(async () => {
    const user = await requireUser();
    const { org: slug } = await ctx.params;
    const org = await requireMembership(user.id, slug);
    return NextResponse.json(org);
  });
}
