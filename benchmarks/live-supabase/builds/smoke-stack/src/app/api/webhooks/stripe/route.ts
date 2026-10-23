import { subscriptionIdsOf, syncSubscription } from "@/lib/billing/server";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. Subscribe the endpoint to:
 *
 *   checkout.session.completed, customer.subscription.created,
 *   customer.subscription.updated, customer.subscription.deleted,
 *   invoice.paid, invoice.payment_failed
 *
 * The signature is the only authentication — there is no user session here —
 * so nothing is read or written before it verifies. After that, every event
 * is reduced to "re-sync these subscriptions", which reads Stripe's current
 * state: duplicates, retries and out-of-order delivery all converge on the
 * same mirror row.
 *
 * A 5xx makes Stripe retry with backoff, which is what a transient failure
 * (database down, Stripe API blip) should get. Anything not ours answers 200.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });

  const payload = await request.text();
  const verified = verifySignature(payload, request.headers.get("stripe-signature"), secret);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  const ids = subscriptionIdsOf(event);
  const results = [];
  for (const id of ids) {
    const result = await syncSubscription(id);
    if (!result.ok) {
      console.error(`Stripe webhook ${event.id} (${event.type}): ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: result.status >= 500 ? 500 : result.status });
    }
    results.push({ id, action: result.action });
  }

  return NextResponse.json({ received: true, synced: results }, { status: 200 });
}
