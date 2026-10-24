import { createHmac, timingSafeEqual } from "node:crypto";

/** Stripe's default tolerance for a signed event's timestamp. */
export const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Checks a Stripe-Signature header: `t=<unix>,v1=<hex>[,v1=…]`, where each v1
 * is HMAC-SHA256 of `<t>.<raw body>` under the endpoint's signing secret.
 * Rejects a missing header, a malformed one, a stale timestamp or no match.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!header) return false;

  let timestamp: string | null = null;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  if (timestamp === null || signatures.length === 0) return false;
  const time = Number(timestamp);
  if (!Number.isFinite(time) || Math.abs(nowSeconds - time) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"),
    "utf8",
  );

  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "utf8");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
