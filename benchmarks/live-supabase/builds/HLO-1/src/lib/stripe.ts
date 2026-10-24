import { createHmac, timingSafeEqual } from "node:crypto";
import { readEnv } from "./supabase/config";

export const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300;

export function stripeConfigured(): boolean {
  return Boolean(readEnv("STRIPE_SECRET_KEY") && readEnv("STRIPE_PRICE_TEAM"));
}

function stripeBase(): string {
  return (readEnv("STRIPE_API_BASE") || "https://api.stripe.com").replace(/\/+$/, "");
}

/**
 * Creates a Checkout session in subscription mode for the Team price. The
 * organization's id goes in client_reference_id so the webhook can find it.
 */
export async function createTeamCheckoutSession(input: {
  orgId: string;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId: string | null;
}): Promise<string> {
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": readEnv("STRIPE_PRICE_TEAM"),
    "line_items[0][quantity]": "1",
    client_reference_id: input.orgId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
  if (input.stripeCustomerId) body.set("customer", input.stripeCustomerId);

  const response = await fetch(`${stripeBase()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${readEnv("STRIPE_SECRET_KEY")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!response.ok || !json?.url) {
    throw new Error(json?.error?.message ?? `Stripe answered ${response.status}.`);
  }
  return json.url;
}

/**
 * Verifies a Stripe-Signature header ("t=...,v1=...") against the raw body with
 * HMAC-SHA256 and the webhook secret, rejecting timestamps outside the tolerance.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!header || !secret) return false;

  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || Math.abs(now - issuedAt) > STRIPE_SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex"),
    "hex",
  );
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
