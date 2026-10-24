import { createHmac, timingSafeEqual } from "node:crypto";
import { stripeApiBase } from "./env";

/** Stripe's default tolerance for a webhook timestamp. */
const TOLERANCE_SECONDS = 300;

/**
 * Checks a `Stripe-Signature` header (`t=<unix>,v1=<hex>`) against the raw body,
 * HMAC-SHA256 over `${t}.${body}`, and refuses timestamps outside the tolerance.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): boolean {
  if (!header) return false;
  let timestamp = Number.NaN;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = Number(value);
    else if (key === "v1" && value) signatures.push(value);
  }
  if (!Number.isInteger(timestamp) || signatures.length === 0) return false;
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest();
  return signatures.some((hex) => {
    const given = Buffer.from(hex, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/**
 * Creates a Checkout session in subscription mode for the Team price, one seat
 * per member, with the organization id as client_reference_id. Returns its URL.
 */
export async function createTeamCheckoutSession(options: {
  organizationId: string;
  seats: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!key || !price) return { ok: false, error: "Billing is not configured" };

  const body = new URLSearchParams({
    mode: "subscription",
    client_reference_id: options.organizationId,
    "line_items[0][price]": price,
    "line_items[0][quantity]": String(Math.max(1, options.seats)),
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  });

  try {
    const res = await fetch(`${stripeApiBase()}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as
      | { url?: string | null; error?: { message?: string } }
      | null;
    if (!res.ok) {
      console.error(`Stripe checkout failed (${res.status}):`, json?.error?.message);
      return { ok: false, error: "The payment provider refused the request" };
    }
    if (!json?.url) return { ok: false, error: "The payment provider returned no checkout page" };
    return { ok: true, url: json.url };
  } catch (err) {
    console.error("Stripe checkout errored:", err);
    return { ok: false, error: "Couldn't reach the payment provider" };
  }
}
