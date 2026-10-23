import { applyCheckoutCompleted, applySubscriptionDeleted } from "@/lib/billing/server";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. Subscribe the endpoint to `checkout.session.completed`
 * (sets the organization in `client_reference_id` to the Team plan) and
 * `customer.subscription.deleted` (back to Free).
 *
 * The signature is the only authentication, so nothing is read or written
 * before it verifies; anything that fails answers 400. Events of other types
 * answer 200 so Stripe does not retry them.
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

  const object = event.data?.object ?? {};
  let result: { ok: true } | { ok: false; error: string } = { ok: true };

  if (event.type === "checkout.session.completed") {
    result = await applyCheckoutCompleted(object);
  } else if (event.type === "customer.subscription.deleted" && typeof object.id === "string") {
    result = await applySubscriptionDeleted(object.id);
  }

  if (!result.ok) {
    console.error(`Stripe webhook ${event.id} (${event.type}): ${result.error}`);
    // 500 makes Stripe retry, which is right for a transient database failure.
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ received: true }, { status: 200 });
}
