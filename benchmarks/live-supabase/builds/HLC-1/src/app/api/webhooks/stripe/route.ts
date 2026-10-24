import { isSupabaseConfigured, stripeConfig } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStripeSignature } from "@/lib/stripe";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // Verify the raw body first; anything that fails verification gets 400.
  const payload = await request.text();
  const { webhookSecret } = stripeConfig();
  if (!webhookSecret || !verifyStripeSignature(payload, request.headers.get("stripe-signature"), webhookSecret)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId === "string" && UUID.test(orgId)) {
      if (!isSupabaseConfigured()) {
        return Response.json({ error: "Supabase is not configured" }, { status: 503 });
      }
      const admin = createAdminClient();
      const { error } = await admin.from("organizations").update({ plan: "team" }).eq("id", orgId);
      if (error) {
        return Response.json({ error: "Could not update the plan" }, { status: 500 });
      }
    }
  }

  return Response.json({ received: true });
}
