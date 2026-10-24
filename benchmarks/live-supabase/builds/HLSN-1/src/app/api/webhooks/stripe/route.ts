import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/billing/webhook";
import { setPlanTeam } from "@/lib/orgs/data";

export const runtime = "nodejs"; // node:crypto for the signature, and the service-role key
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Stripe's webhook. The signature is checked against STRIPE_WEBHOOK_SECRET
 * before anything is read: a request that fails answers 400. On
 * checkout.session.completed the organization named by client_reference_id
 * moves to the team plan. Other events answer 200 and change nothing.
 */
export async function POST(request: Request) {
  const payload = await request.text();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: unknown; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId === "string" && UUID.test(orgId)) {
      try {
        await setPlanTeam(orgId);
      } catch (error) {
        // A 5xx makes Stripe retry: the database was unavailable.
        console.error("Stripe webhook: could not set the team plan:", error);
        return NextResponse.json({ error: "Could not update the organization" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
