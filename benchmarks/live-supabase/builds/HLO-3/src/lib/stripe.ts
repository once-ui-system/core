import { createHmac, timingSafeEqual } from "node:crypto";
import { env, stripeApiBase } from "./env";

const TOLERANCE_SECONDS = 300;

/**
 * Checks a Stripe-Signature header (`t=<unix>,v1=<hex>,...`) against the raw body.
 * Returns false for anything that does not verify.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, now = Date.now()): boolean {
  if (!header || !secret) return false;
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2).map((s) => s.trim());
    if (key === "t") timestamp = value ?? "";
    if (key === "v1" && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(now / 1000 - seconds) > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest();
  return signatures.some((sig) => {
    if (!/^[0-9a-f]+$/i.test(sig) || sig.length !== expected.length * 2) return false;
    return timingSafeEqual(expected, Buffer.from(sig, "hex"));
  });
}

/** Creates a Stripe Checkout session in subscription mode for the Team price. */
export async function createTeamCheckout(params: {
  orgId: string;
  seats: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": env("STRIPE_PRICE_TEAM"),
    "line_items[0][quantity]": String(Math.max(1, params.seats)),
    client_reference_id: params.orgId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
  const response = await fetch(`${stripeApiBase()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("STRIPE_SECRET_KEY")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!response.ok || !json.url) {
    throw new Error(json.error?.message ?? `Stripe answered ${response.status}`);
  }
  return { url: json.url };
}
