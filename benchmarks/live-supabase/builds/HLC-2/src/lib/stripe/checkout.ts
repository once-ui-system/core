import "server-only";
import { env } from "@/lib/env";

export class StripeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Base URL for Stripe API calls: STRIPE_API_BASE when set (e.g. stripe-mock), otherwise Stripe. */
export function stripeApiBase(): string {
  return (env.stripeApiBase() ?? "https://api.stripe.com").replace(/\/+$/, "");
}

/** Creates a subscription Checkout session for the Team plan; returns its URL. */
export async function createTeamCheckoutUrl(args: {
  orgId: string;
  slug: string;
  origin: string;
}): Promise<string> {
  const secretKey = env.stripeSecretKey();
  const price = env.stripePriceTeam();
  if (!secretKey || !price) throw new StripeError("Stripe is not configured", 503);

  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: args.orgId,
    success_url: `${args.origin}/app/${args.slug}/settings?upgraded=1`,
    cancel_url: `${args.origin}/app/${args.slug}/settings`,
  });

  let response: Response;
  try {
    response = await fetch(`${stripeApiBase()}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch {
    throw new StripeError("Stripe could not be reached", 502);
  }
  const json = (await response.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!response.ok || !json?.url) {
    throw new StripeError(json?.error?.message ?? "Stripe did not return a Checkout URL", 502);
  }
  return json.url;
}
