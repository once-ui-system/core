import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { createInvitation, requireManager, requireUser } from "@/lib/orgs/server";

export function POST(req: Request, ctx: RouteContext<"/api/orgs/[org]/invitations">) {
  return handle(async () => {
    const user = await requireUser();
    const { org: slug } = await ctx.params;
    const org = await requireManager(user.id, slug);
    const body = await readJson(req);
    const email = typeof body.email === "string" ? body.email : undefined;
    const token = await createInvitation(user.id, org, String(body.role ?? ""), email);
    const url = `${new URL(req.url).origin}/invite/${token}`;
    return NextResponse.json({ token, url }, { status: 201 });
  });
}
