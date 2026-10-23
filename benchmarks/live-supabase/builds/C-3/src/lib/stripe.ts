import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export function stripeBase() {
  return (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
}

export async function createCheckoutSession(opts: {
  orgId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!key || !price) throw new Error("Stripe is not configured");
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: opts.orgId,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  });
  const res = await fetch(`${stripeBase()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) throw new Error(json.error?.message ?? "Stripe error");
  return json.url;
}

/** Verifies a Stripe-Signature header (t=...,v1=...) over the raw body. */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSec = 300,
): boolean {
  if (!header || !secret) return false;
  let t = "";
  const sigs: string[] = [];
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === "t") t = v;
    else if (k === "v1") sigs.push(v);
  }
  if (!t || sigs.length === 0 || !/^\d+$/.test(t)) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest();
  return sigs.some((s) => {
    if (!/^[0-9a-f]+$/i.test(s)) return false;
    const b = Buffer.from(s, "hex");
    return b.length === expected.length && timingSafeEqual(b, expected);
  });
}
