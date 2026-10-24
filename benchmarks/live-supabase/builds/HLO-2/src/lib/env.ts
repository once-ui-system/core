// Variables are read at request time, not inlined at build time, so one build
// runs in demo mode or live depending on what the server is started with.
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function supabaseConfig(): { url: string; anonKey: string } {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  return { url, anonKey };
}

export function isStripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_PRICE_TEAM"));
}

export function stripeApiBase(): string {
  return (env("STRIPE_API_BASE") ?? "https://api.stripe.com").replace(/\/+$/, "");
}
