import { createAdmin } from "@/lib/supabase/server";
import { verifyStripeSignature } from "@/lib/stripe";

const reply = (body: unknown, status: number) => Response.json(body, { status });

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await req.text();
  if (!secret || !verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret))
    return reply({ error: "Invalid signature" }, 400);

  let event: { type?: string; data?: { object?: { client_reference_id?: string | null } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return reply({ error: "Invalid payload" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (orgId && /^[0-9a-f-]{36}$/i.test(orgId)) {
      const { error } = await createAdmin().from("organizations").update({ plan: "team" }).eq("id", orgId);
      if (error) return reply({ error: "Could not update plan" }, 500);
    }
  }
  return reply({ received: true }, 200);
}
