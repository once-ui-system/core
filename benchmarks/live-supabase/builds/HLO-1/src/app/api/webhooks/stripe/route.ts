import { verifyStripeSignature } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, readEnv } from "@/lib/supabase/config";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CheckoutSession = {
  client_reference_id?: string | null;
  customer?: string | null;
};

export async function POST(request: Request) {
  // Verify the raw body before anything else; anything that fails answers 400.
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(payload, signature, readEnv("STRIPE_WEBHOOK_SECRET"))) {
    return new Response("Invalid signature.", { status: 400 });
  }

  let event: { type?: string; data?: { object?: CheckoutSession } };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object ?? {};
    const orgId = session.client_reference_id;
    if (typeof orgId !== "string" || !UUID.test(orgId)) {
      return new Response("Missing client_reference_id.", { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return new Response("Supabase is not configured.", { status: 503 });
    }

    const update: { plan: "team"; stripe_customer_id?: string } = { plan: "team" };
    if (typeof session.customer === "string") update.stripe_customer_id = session.customer;
    const { error } = await createAdminClient().from("organizations").update(update).eq("id", orgId);
    if (error) return new Response("Could not update the organization.", { status: 500 });
  }

  return Response.json({ received: true });
}
