// Environment switches. With no Supabase variables set the app runs in demo mode.

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return { url, anonKey };
}

export function serviceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
}

export function stripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || undefined,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    priceTeam: process.env.STRIPE_PRICE_TEAM || undefined,
    apiBase: (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, ""),
  };
}
