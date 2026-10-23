import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { acceptInvitation, requireUser } from "@/lib/orgs/server";

export function POST(_req: Request, ctx: RouteContext<"/api/invitations/[token]">) {
  return handle(async () => {
    const user = await requireUser();
    const { token } = await ctx.params;
    const { slug } = await acceptInvitation(user, token);
    return NextResponse.json({ ok: true, slug });
  });
}
