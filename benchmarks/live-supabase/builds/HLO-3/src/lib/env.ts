// Reads variables at runtime (not inlined at build time), so one build can run
// in demo mode or against live services.
export function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function isStripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_PRICE_TEAM"));
}

export function stripeApiBase(): string {
  return (env("STRIPE_API_BASE") || "https://api.stripe.com").replace(/\/+$/, "");
}
