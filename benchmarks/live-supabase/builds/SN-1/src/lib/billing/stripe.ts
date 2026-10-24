/**
 * The few Stripe REST calls billing needs, over global fetch (server-only).
 *
 * No `stripe` dependency, same as scripts/stripe-sync.mjs: an app with the
 * billing slice installs exactly what an app without it installs, and still
 * builds and runs with no environment at all. Calls return a result rather
 * than throwing, like the org guards, so a route handler is one branch.
 */

export type BillingMode = "stripe" | "mock" | "off";

export function stripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY || undefined;
}

/**
 * Which billing backend this deployment runs.
 *
 * - `stripe`: a secret key is set. Test or live is the key's business.
 * - `mock`: no key, outside production. Checkout activates the plan directly
 *   in the database, so the whole flow can be built and demoed with no Stripe
 *   account at all.
 * - `off`: no key in production. Nothing can be bought; a mock there would
 *   hand plans out for free.
 */
export function billingMode(): BillingMode {
  if (stripeSecretKey()) return "stripe";
  return process.env.NODE_ENV === "production" ? "off" : "mock";
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

/** The parts of a Stripe subscription the mirror keeps. Both API shapes are typed. */
export interface StripeSubscription {
  id: string;
  customer: string | { id: string };
  status: string;
  cancel_at_period_end: boolean;
  /** Before 2025-03-31 the period lived here… */
  current_period_start?: number;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items: {
    data: {
      quantity?: number;
      /** …and from then on, per item. */
      current_period_start?: number;
      current_period_end?: number;
      price: { id: string; lookup_key: string | null };
    }[];
  };
}
