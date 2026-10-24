import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, stripeApiBase } from "@/lib/env";

// Creates a Checkout session in subscription mode for the Team price. The
// organization id goes in client_reference_id so the webhook can find it.
export async function createTeamCheckoutSession(input: {
  orgId: string;
  slug: string;
  quantity: number;
  origin: string;
}): Promise<string> {
  const secretKey = env("STRIPE_SECRET_KEY");
  const price = env("STRIPE_PRICE_TEAM");
  if (!secretKey || !price) throw new Error("Stripe is not configured");

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", price);
  body.set("line_items[0][quantity]", String(Math.max(1, input.quantity)));
  body.set("client_reference_id", input.orgId);
  body.set("success_url", `${input.origin}/app/${input.slug}/settings?checkout=success`);
  body.set("cancel_url", `${input.origin}/app/${input.slug}/settings?checkout=cancelled`);

  const response = await fetch(`${stripeApiBase()}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!response.ok || !json?.url) {
    throw new Error(json?.error?.message ?? `Stripe returned HTTP ${response.status}`);
  }
  return json.url;
}

// Checks a Stripe-Signature header: t=<timestamp>,v1=<hmac>[,v1=...]. The HMAC is
// SHA-256 over "<timestamp>.<raw body>" with the endpoint's signing secret.
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!header) return false;
  let timestamp: number | undefined;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = Number(value);
    if (key === "v1") signatures.push(value);
  }
  if (timestamp === undefined || !Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"),
    "utf8",
  );
  return signatures.some((signature) => {
    const given = Buffer.from(signature, "utf8");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
