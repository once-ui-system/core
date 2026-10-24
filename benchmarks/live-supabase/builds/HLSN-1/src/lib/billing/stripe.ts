/**
 * Stripe over its REST API. Every call goes to STRIPE_API_BASE when it is set
 * (for example a local stripe-mock) and to https://api.stripe.com otherwise.
 */
export function stripeApiBase(): string {
  return (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_TEAM);
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; status: number; error: string };

/**
 * A subscription Checkout session for the Team price. The organization's id
 * is the client_reference_id, which the webhook reads to upgrade it.
 */
export async function createTeamCheckout(input: {
  orgId: string;
  slug: string;
  quantity: number;
  origin: string;
}): Promise<CheckoutResult> {
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!secret || !price) {
    return { ok: false, status: 503, error: "Stripe is not configured." };
  }

  const body = new URLSearchParams({
    mode: "subscription",
    client_reference_id: input.orgId,
    "line_items[0][price]": price,
    "line_items[0][quantity]": String(Math.max(1, input.quantity)),
    success_url: `${input.origin}/app/${input.slug}/settings?upgraded=1`,
    cancel_url: `${input.origin}/app/${input.slug}/settings`,
  });

  let response: Response;
  try {
    response = await fetch(`${stripeApiBase()}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Stripe checkout request failed:", error);
    return { ok: false, status: 502, error: "Could not reach Stripe." };
  }

  const payload = (await response.json().catch(() => null)) as
    | { url?: unknown; error?: { message?: string } }
    | null;

  if (!response.ok || typeof payload?.url !== "string") {
    console.error("Stripe checkout failed:", response.status, payload?.error?.message);
    return { ok: false, status: 502, error: "Stripe did not start a checkout session." };
  }

  return { ok: true, url: payload.url };
}
