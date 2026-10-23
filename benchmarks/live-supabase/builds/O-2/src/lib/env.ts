// Read through an alias so values are looked up at runtime, not inlined at build.
const env = (): Record<string, string | undefined> => process.env;

export function isSupabaseConfigured(): boolean {
  const e = env();
  return Boolean(e.NEXT_PUBLIC_SUPABASE_URL && e.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function supabaseConfig() {
  const e = env();
  return { url: e.NEXT_PUBLIC_SUPABASE_URL ?? "", anonKey: e.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" };
}

export function stripeEnv() {
  const e = env();
  return {
    secretKey: e.STRIPE_SECRET_KEY ?? "",
    webhookSecret: e.STRIPE_WEBHOOK_SECRET ?? "",
    priceTeam: e.STRIPE_PRICE_TEAM ?? "",
    apiBase: (e.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, ""),
  };
}

export function serviceRoleKey(): string {
  return env().SUPABASE_SERVICE_ROLE_KEY ?? "";
}
