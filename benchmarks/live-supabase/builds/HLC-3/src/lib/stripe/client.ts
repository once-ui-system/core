import "server-only";

// Minimal Stripe REST client. Every call goes to STRIPE_API_BASE when it is set
// (for example a local stripe-mock), otherwise to https://api.stripe.com.

export class StripeError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_TEAM);
}

export function stripeApiBase(): string {
  const base = process.env.STRIPE_API_BASE?.trim() || "https://api.stripe.com";
  return base.replace(/\/+$/, "");
}

export async function stripeRequest(
  method: "GET" | "POST",
  path: string,
  params?: URLSearchParams
): Promise<unknown> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("STRIPE_SECRET_KEY is not set", 503);

  const response = await fetch(`${stripeApiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? params.toString() : undefined,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new StripeError(data?.error?.message ?? `Stripe returned ${response.status}`, 502);
  }
  return data;
}

// Checkout Session in subscription mode for the Team plan price. The organization
// id goes in client_reference_id so the webhook knows which organization upgraded.
export async function createTeamCheckoutSession(args: {
  orgId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const price = process.env.STRIPE_PRICE_TEAM;
  if (!price) throw new StripeError("STRIPE_PRICE_TEAM is not set", 503);

  const params = new URLSearchParams({
    mode: "subscription",
    client_reference_id: args.orgId,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    "line_items[0][price]": price,
    "line_items[0][quantity]": String(Math.max(1, args.quantity)),
  });
  const session = (await stripeRequest("POST", "/v1/checkout/sessions", params)) as {
    url?: string | null;
  };
  if (!session?.url) throw new StripeError("Stripe did not return a Checkout URL", 502);
  return { url: session.url };
}
