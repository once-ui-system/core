import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/webhooks/stripe. Answers 400 to any request whose signature does not
 * verify. On checkout.session.completed it sets the plan of the organization in
 * client_reference_id to team.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: { code: "not_configured", message: "Webhooks are not configured" } }, { status: 503 });
  }

  // The signature covers the exact bytes Stripe sent, so read the body as text.
  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: { code: "invalid_signature", message: "Invalid signature" } }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: { code: "invalid_payload", message: "Invalid JSON" } }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object ?? {};
    const organizationId = session.client_reference_id;
    if (typeof organizationId === "string" && UUID.test(organizationId)) {
      const admin = createAdminSupabase();
      const { error } = await admin
        .from("organizations")
        .update({
          plan: "team",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
        })
        .eq("id", organizationId);
      // A database failure answers 500 so Stripe retries the delivery.
      if (error) {
        console.error("Setting the Team plan failed:", error);
        return NextResponse.json({ error: { code: "internal_error", message: "Failed to update the plan" } }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
