import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireManager, requireUser } from "@/lib/orgs/server";
import { createCheckoutSession } from "@/lib/stripe";

export function POST(req: Request, ctx: RouteContext<"/api/orgs/[org]/billing/checkout">) {
  return handle(async () => {
    const user = await requireUser();
    const { org: slug } = await ctx.params;
    const org = await requireManager(user.id, slug);
    const origin = new URL(req.url).origin;
    const url = await createCheckoutSession({
      orgId: org.id,
      successUrl: `${origin}/app/${org.slug}/settings?upgraded=1`,
      cancelUrl: `${origin}/app/${org.slug}/settings`,
    });
    return NextResponse.json({ url });
  });
}
