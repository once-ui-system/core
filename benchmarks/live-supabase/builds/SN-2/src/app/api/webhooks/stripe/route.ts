import { verifySignature } from "@/lib/billing/signature";
import { supabaseSecretKey } from "@/lib/sb/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. The signature is the only authentication, so nothing is
 * read or written before it verifies; anything that fails answers 400.
 * `checkout.session.completed` moves the organization in `client_reference_id`
 * to the Team plan. Every other event is acknowledged and ignored.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });

  const verified = verifySignature(payload, request.headers.get("stripe-signature"), secret);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (typeof orgId === "string" && orgId) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = supabaseSecretKey();
      if (!url || !key) {
        return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
      }
      const service = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await service.from("organizations").update({ plan: "team" }).eq("id", orgId);
      // 500 makes Stripe retry; a malformed id is ours to ignore.
      if (error && error.code !== "22P02") {
        console.error("Stripe webhook: failed to set the plan", error.message);
        return NextResponse.json({ error: "Failed to update the plan" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
