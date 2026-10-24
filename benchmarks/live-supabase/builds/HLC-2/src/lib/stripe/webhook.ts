import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_SECONDS = 300;

/**
 * Checks a Stripe-Signature header against the raw request body, the same way
 * Stripe's libraries do: HMAC-SHA256 over "<t>.<payload>", any v1 signature may
 * match, and the timestamp must be within the tolerance window.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!header) return false;
  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;
  const t = Number(timestamp);
  if (!Number.isFinite(t) || Math.abs(now - t) > TOLERANCE_SECONDS) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"),
    "hex",
  );
  return signatures.some((sig) => {
    const given = Buffer.from(sig, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
