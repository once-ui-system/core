/**
 * Which live services this deployment has. With no environment variables set the
 * app runs in demo mode: nothing is gated and the sample organization is used.
 * Read the public variables by their full name so the client bundle can inline them.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_TEAM);
}

/** Stripe's API root. STRIPE_API_BASE points it at a local stripe-mock. */
export function stripeApiBase(): string {
  return (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
}
