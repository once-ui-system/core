import { createHmac, timingSafeEqual } from "node:crypto";
import { stripeEnv } from "../../../../lib/env";
import { adminClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

function verify(payload: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length) return false;
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  return sigs.some((s) => {
    const b = Buffer.from(s);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  if (!verify(payload, request.headers.get("stripe-signature"), stripeEnv().webhookSecret)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  let event: { type?: string; data?: { object?: { client_reference_id?: string | null } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const orgId = event.data?.object?.client_reference_id;
    if (orgId && /^[0-9a-f-]{36}$/i.test(orgId)) {
      const { error } = await adminClient().from("organizations").update({ plan: "team" }).eq("id", orgId);
      if (error) return Response.json({ error: "Update failed" }, { status: 500 });
    }
  }
  return Response.json({ received: true });
}
