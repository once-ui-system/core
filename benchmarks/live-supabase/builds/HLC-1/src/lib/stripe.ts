import { createHmac, timingSafeEqual } from "node:crypto";
import { stripeConfig } from "@/lib/env";

// Stripe over plain HTTPS, so STRIPE_API_BASE can point at stripe-mock or any compatible host.

export class StripeError extends Error {}

export async function createTeamCheckoutSession(input: {
  orgId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const { secretKey, priceTeam, apiBase } = stripeConfig();
  if (!secretKey || !priceTeam) {
    throw new StripeError("Billing is not configured");
  }
  const body = new URLSearchParams({
    mode: "subscription",
    client_reference_id: input.orgId,
    "line_items[0][price]": priceTeam,
    "line_items[0][quantity]": String(Math.max(1, input.quantity)),
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
  const res = await fetch(`${apiBase}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!res.ok || !json?.url) {
    throw new StripeError(json?.error?.message ?? `Stripe responded ${res.status}`);
  }
  return { url: json.url };
}

// Checks a Stripe-Signature header ("t=...,v1=...") against the raw request body.
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  nowSeconds = Math.floor(Date.now() / 1000),
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
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  return signatures.some((signature) => {
    if (!/^[0-9a-f]+$/i.test(signature) || signature.length !== expected.length * 2) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), expected);
  });
}
