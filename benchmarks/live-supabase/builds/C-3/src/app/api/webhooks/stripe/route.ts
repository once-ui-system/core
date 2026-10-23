import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/stripe";
import { createAdminClient } from "@/lib/sb/server";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await req.text();
  if (!secret || !verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  let event: { type?: string; data?: { object?: { client_reference_id?: string | null } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (orgId && /^[0-9a-f-]{36}$/i.test(orgId)) {
      const { error } = await createAdminClient()
        .from("organizations")
        .update({ plan: "team" })
        .eq("id", orgId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
