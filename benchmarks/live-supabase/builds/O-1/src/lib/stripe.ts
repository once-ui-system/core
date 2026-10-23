import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const base = () => (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/$/, "");

/** Creates a subscription Checkout session for the Team price; returns its URL. */
export async function createTeamCheckout(opts: { orgId: string; successUrl: string; cancelUrl: string; email?: string }) {
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", process.env.STRIPE_PRICE_TEAM ?? "");
  body.set("line_items[0][quantity]", "1");
  body.set("client_reference_id", opts.orgId);
  body.set("success_url", opts.successUrl);
  body.set("cancel_url", opts.cancelUrl);
  if (opts.email) body.set("customer_email", opts.email);
  const res = await fetch(`${base()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY ?? ""}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) throw new Error(json.error?.message ?? `Stripe answered ${res.status}`);
  return json.url;
}

/** Verifies a Stripe-Signature header (t=…,v1=…) over the raw body. */
export function verifyStripeSignature(raw: string, header: string | null, secret: string, toleranceSec = 300) {
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
  const ts = Number(t);
  if (!t || !Number.isFinite(ts) || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest();
  return sigs.some((s) => {
    if (!/^[0-9a-f]+$/i.test(s) || s.length !== expected.length * 2) return false;
    return timingSafeEqual(Buffer.from(s, "hex"), expected);
  });
}
