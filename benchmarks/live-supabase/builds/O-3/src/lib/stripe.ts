import { createHmac, timingSafeEqual } from "node:crypto";
import { stripeBase, stripePriceTeam, stripeSecretKey } from "./env";

export async function createCheckoutSession(opts: {
  orgId: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
}): Promise<{ url: string }> {
  const key = stripeSecretKey();
  const price = stripePriceTeam();
  if (!key || !price) throw new Error("Stripe is not configured");
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: opts.orgId,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    "metadata[org_id]": opts.orgId,
  });
  if (opts.email) body.set("customer_email", opts.email);
  const res = await fetch(`${stripeBase()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) throw new Error(data.error?.message ?? `Stripe error ${res.status}`);
  return { url: data.url };
}

/** Verifies a Stripe-Signature header (t=...,v1=...) against the raw body. */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string | undefined,
  toleranceSeconds = 300,
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
  const ts = Number(t);
  if (!t || !Number.isFinite(ts) || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest();
  return sigs.some((s) => {
    if (!/^[0-9a-f]+$/i.test(s) || s.length !== expected.length * 2) return false;
    return timingSafeEqual(Buffer.from(s, "hex"), expected);
  });
}
