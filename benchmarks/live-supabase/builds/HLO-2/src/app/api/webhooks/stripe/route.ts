import { isSupabaseConfigured, env } from "@/lib/env";
import { fail, guarded } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { setPlanToTeam } from "@/lib/orgs/service";
import { verifyStripeSignature } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Verifies the Stripe-Signature header before reading the event. Anything that
// fails verification or is malformed gets 400, so Stripe can see the failure.
export const POST = guarded(async (request: Request) => {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret || !isSupabaseConfigured() || !env("SUPABASE_SERVICE_ROLE_KEY")) {
    return fail(503, "Webhook is not configured");
  }

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return fail(400, "Invalid signature");
  }

  let event: { type?: unknown; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return fail(400, "Invalid JSON");
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId !== "string" || !UUID.test(orgId)) return fail(400, "Missing client_reference_id");
    await setPlanToTeam(orgId, createAdminClient());
  }
  return Response.json({ received: true });
});
