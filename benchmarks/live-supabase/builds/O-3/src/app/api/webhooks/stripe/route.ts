import { NextResponse } from "next/server";
import { stripeWebhookSecret } from "@/lib/env";
import { verifyStripeSignature } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const payload = await req.text();
  const ok = verifyStripeSignature(
    payload,
    req.headers.get("stripe-signature"),
    stripeWebhookSecret(),
  );
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const obj = event.data?.object ?? {};
    const orgId = obj.client_reference_id;
    if (typeof orgId === "string" && UUID.test(orgId)) {
      const update: Record<string, string> = { plan: "team" };
      if (typeof obj.customer === "string") update.stripe_customer_id = obj.customer;
      if (typeof obj.subscription === "string") update.stripe_subscription_id = obj.subscription;
      const { error } = await admin().from("organizations").update(update).eq("id", orgId);
      if (error) {
        console.error(error);
        return NextResponse.json({ error: "Could not update plan" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
