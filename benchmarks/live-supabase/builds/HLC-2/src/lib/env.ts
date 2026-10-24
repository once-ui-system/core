// Environment access. Keys are read through a variable name, so Next does not
// inline them at build time: the same build runs in demo mode or live, decided
// by the variables present when the server starts.

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export const env = {
  supabaseUrl: () => read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => read("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: () => read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => read("STRIPE_WEBHOOK_SECRET"),
  stripePriceTeam: () => read("STRIPE_PRICE_TEAM"),
  stripeApiBase: () => read("STRIPE_API_BASE"),
};

/** True when the Supabase variables are set: auth gating and the database are live. */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl() && env.supabaseAnonKey());
}
