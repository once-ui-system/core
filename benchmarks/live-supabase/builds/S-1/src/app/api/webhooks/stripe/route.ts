import { setTeamPlan } from "@/lib/billing/server";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. The signature is the only authentication, so nothing is
 * read or written before it verifies; anything that fails it gets 400.
 *
 * `checkout.session.completed` puts the organization in `client_reference_id`
 * on the Team plan. Every other event is acknowledged and ignored.
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });

  const verified = verifySignature(payload, request.headers.get("stripe-signature"), secret);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const ref = event.data?.object?.client_reference_id;
    if (typeof ref === "string" && ref) {
      const result = await setTeamPlan(ref);
      if (!result.ok) {
        console.error(`Stripe webhook ${event.id}: ${result.error}`);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
