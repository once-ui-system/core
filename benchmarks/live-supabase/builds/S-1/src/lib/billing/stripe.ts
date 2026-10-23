/**
 * The one Stripe REST call billing needs, over global fetch (server-only).
 *
 * `STRIPE_API_BASE` (for example a local stripe-mock) replaces
 * https://api.stripe.com for every call.
 */

export function stripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY || undefined;
}

export function stripeApiBase(): string {
  return (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
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

export async function stripePost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<StripeResult<T>> {
  const key = stripeSecretKey();
  if (!key) return { ok: false, status: 503, error: "Stripe is not configured" };

  try {
    const res = await fetch(`${stripeApiBase()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formEncode(body).toString(),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    if (!res.ok) {
      console.error(`Stripe POST ${path} failed (${res.status}):`, json?.error?.message);
      return { ok: false, status: 502, error: "The payment provider refused the request" };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    console.error(`Stripe POST ${path} errored:`, err);
    return { ok: false, status: 502, error: "Couldn't reach the payment provider" };
  }
}
