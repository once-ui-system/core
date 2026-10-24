import { errorResponse, json } from "@/lib/api";
import { isSupabaseConfigured, env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyStripeSignature } from "@/lib/stripe/webhook";

export async function POST(request: Request) {
  // The raw body is what Stripe signed, so read it as text before parsing.
  const payload = await request.text();
  const secret = env.stripeWebhookSecret();
  if (!secret || !verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return json({ error: "invalid signature" }, 400);
  }

  let event: { type?: unknown; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: "invalid payload" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId === "string" && orgId.length > 0) {
      if (!isSupabaseConfigured()) return json({ error: "Supabase is not configured" }, 503);
      try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin.from("organizations").update({ plan: "team" }).eq("id", orgId);
        if (error) throw new Error(error.message);
      } catch (error) {
        return errorResponse(error);
      }
    }
  }
  return json({ received: true });
}
