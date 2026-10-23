import { activateTeamPlan } from "@/lib/billing/server";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. The signature is the only authentication, so nothing is
 * read or written before it verifies; anything that fails answers 400.
 * `checkout.session.completed` puts the organization named by the session's
 * `client_reference_id` on the Team plan.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();
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
    const result = await activateTeamPlan(event.data?.object?.client_reference_id);
    if (!result.ok) {
      console.error(`Stripe webhook ${event.id}: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
