import { setOrganizationPlan } from "@/lib/billing/server";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook, `POST /api/webhooks/stripe`.
 *
 * The `Stripe-Signature` header is verified against STRIPE_WEBHOOK_SECRET
 * before anything is read or written; anything that fails answers 400. On
 * `checkout.session.completed` the organization named in the session's
 * `client_reference_id` moves to the `team` plan. Other events answer 200.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });

  const payload = await request.text();
  const verified = verifySignature(payload, request.headers.get("stripe-signature"), secret);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  let event: { id?: string; type?: string; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const organizationId = event.data?.object?.client_reference_id;
    if (typeof organizationId === "string" && organizationId.length > 0) {
      const result = await setOrganizationPlan(organizationId, "team");
      if (!result.ok) {
        console.error(`Stripe webhook ${event.id}: ${result.error}`);
        // A 5xx makes Stripe retry, which is what a transient failure should get.
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
