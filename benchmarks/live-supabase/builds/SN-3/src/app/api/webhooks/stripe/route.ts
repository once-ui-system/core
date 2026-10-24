import { verifySignature } from "@/lib/billing/signature";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // node:crypto for the signature, and the service role key
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });

  const payload = await request.text();
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
      if (!isSupabaseConfigured() || !url || !key) {
        return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
      }
      const service = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await service.from("organizations").update({ plan: "team" }).eq("id", orgId);
      if (error) {
        console.error(`Stripe webhook ${event.id}: could not set the plan`, error.message);
        return NextResponse.json({ error: "Failed to update the plan" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
