import { setPlanTeam } from "@/lib/billing/checkout";
import { verifySignature } from "@/lib/billing/signature";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Stripe's webhook. The signature is the only authentication, so nothing is
 * read or written before it verifies; anything that fails answers 400.
 * `checkout.session.completed` puts the organization named in
 * `client_reference_id` on the Team plan; other events are acknowledged.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();
  const verified = secret
    ? verifySignature(payload, request.headers.get("stripe-signature"), secret)
    : { ok: false as const, error: "Webhook secret not configured" };
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const ref = event.data?.object?.client_reference_id;
    if (typeof ref !== "string" || !UUID.test(ref)) {
      return NextResponse.json({ error: "Missing client_reference_id" }, { status: 400 });
    }
    const result = await setPlanTeam(ref);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
