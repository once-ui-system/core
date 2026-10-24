import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonError, UUID_PATTERN } from "@/lib/http";
import { verifyStripeSignature } from "@/lib/stripe/webhook";

// Stripe webhook. Answers 400 when the Stripe-Signature header does not verify.
// On checkout.session.completed it sets the plan of the organization named in
// client_reference_id to "team".
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return jsonError(400, "Invalid signature");
  }

  let event: { type?: unknown; data?: { object?: { client_reference_id?: unknown } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return jsonError(400, "Body is not JSON");
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId !== "string" || !UUID_PATTERN.test(orgId)) {
      return NextResponse.json({ received: true, ignored: "no organization" });
    }
    if (!isSupabaseConfigured()) return jsonError(503, "Supabase is not configured");

    const { error } = await createAdminClient()
      .from("organizations")
      .update({ plan: "team" })
      .eq("id", orgId);
    if (error) return jsonError(500, error.message);
  }

  return NextResponse.json({ received: true });
}
