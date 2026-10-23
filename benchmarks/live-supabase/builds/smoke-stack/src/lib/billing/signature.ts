/**
 * Stripe webhook signatures, checked without the `stripe` package (server-only).
 *
 * The `Stripe-Signature` header is `t=<unix seconds>,v1=<hex>[,v1=<hex>…]`.
 * The signed payload is `${t}.${rawBody}`, HMAC-SHA256 with the endpoint's
 * signing secret. A timestamp outside the tolerance is refused so a captured
 * request cannot be replayed later.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Stripe's own default. */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export function signPayload(payload: string, secret: string, timestamp: number): string {
  return createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
}

/** The header Stripe would send — for tests and local webhook rehearsals. */
export function signatureHeader(
  payload: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
): string {
  return `t=${timestamp},v1=${signPayload(payload, secret, timestamp)}`;
}

export function verifySignature(
  payload: string,
  header: string | null,
  secret: string,
  options: { toleranceSeconds?: number; now?: number } = {},
): { ok: true } | { ok: false; error: string } {
  if (!header) return { ok: false, error: "Missing Stripe-Signature header" };

  let timestamp = Number.NaN;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = Number(value);
    else if (key === "v1" && value) signatures.push(value);
  }
  if (!Number.isInteger(timestamp) || signatures.length === 0) {
    return { ok: false, error: "Malformed Stripe-Signature header" };
  }

  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > (options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS)) {
    return { ok: false, error: "Signature timestamp outside the tolerance" };
  }

  const expected = Buffer.from(signPayload(payload, secret, timestamp), "hex");
  const matched = signatures.some((sig) => {
    const given = Buffer.from(sig, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  return matched ? { ok: true } : { ok: false, error: "No signature matches the payload" };
}
