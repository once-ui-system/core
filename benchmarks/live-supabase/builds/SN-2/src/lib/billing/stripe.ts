/**
 * The few Stripe REST calls billing needs, over global fetch (server-only).
 *
 * No `stripe` dependency; the app still builds and runs with no environment. Calls return a result rather
 * than throwing, like the org guards, so a route handler is one branch.
 */

/** Pinned so response shapes do not move when the account's default version does. */
const STRIPE_VERSION = "2025-03-31.basil";

export function stripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY || undefined;
}

export type StripeResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

/** Stripe takes form-encoded bodies, nested keys as `a[b][c]` and arrays as `a[0]`. */
export function formEncode(
  obj: Record<string, unknown>,
  prefix = "",
  acc = new URLSearchParams(),
): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const name = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object")
          formEncode(item as Record<string, unknown>, `${name}[${i}]`, acc);
        else acc.append(`${name}[${i}]`, String(item));
      });
    } else if (typeof v === "object") {
      formEncode(v as Record<string, unknown>, name, acc);
    } else {
      acc.append(name, String(v));
    }
  }
  return acc;
}

export async function stripe<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: Record<string, unknown>,
  options: { idempotencyKey?: string } = {},
): Promise<StripeResult<T>> {
  const key = stripeSecretKey();
  if (!key) return { ok: false, status: 503, error: "Stripe is not configured" };

  const base = process.env.STRIPE_API_BASE || "https://api.stripe.com";
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Stripe-Version": STRIPE_VERSION,
        ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      ...(body ? { body: formEncode(body).toString() } : {}),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    if (!res.ok) {
      // Stripe's message names the parameter at fault; it goes to the log,
      // and the caller gets a generic line it can show a customer.
      console.error(`Stripe ${method} ${path} failed (${res.status}):`, json?.error?.message);
      return { ok: false, status: 502, error: "The payment provider refused the request" };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    console.error(`Stripe ${method} ${path} errored:`, err);
    return { ok: false, status: 502, error: "Couldn't reach the payment provider" };
  }
}

