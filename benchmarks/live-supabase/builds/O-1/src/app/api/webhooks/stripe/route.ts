import { createAdminClient } from "../../../../lib/supabase/server";
import { verifyStripeSignature } from "../../../../lib/stripe";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await request.text();
  if (!secret || !verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret)) {
    return new Response("Invalid signature", { status: 400 });
  }
  let event: { type?: string; data?: { object?: { client_reference_id?: string | null } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (orgId && UUID.test(orgId)) {
      const { error } = await createAdminClient().from("organizations").update({ plan: "team" }).eq("id", orgId);
      if (error) return new Response("Database error", { status: 500 });
    }
  }
  return Response.json({ received: true });
}
