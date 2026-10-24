import { errorJson, json } from "@/lib/api";
import { env } from "@/lib/env";
import { setOrgPlan } from "@/lib/orgs";
import { verifyStripeSignature } from "@/lib/stripe";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // The signature is checked against the exact bytes Stripe sent.
  const raw = await request.text();
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"), env("STRIPE_WEBHOOK_SECRET"))) {
    return errorJson("Invalid signature.", 400);
  }

  let event: { type?: string; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return errorJson("Body is not JSON.", 400);
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId === "string" && UUID.test(orgId)) {
      await setOrgPlan(orgId, "team");
    }
  }
  return json({ received: true });
}
