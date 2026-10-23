// Read through a variable key so the values are looked up when the server runs,
// not inlined when the app is built.
const read = (name: string): string | undefined => process.env[name] || undefined;

export const supabaseUrl = () => read("NEXT_PUBLIC_SUPABASE_URL");
export const supabaseAnonKey = () => read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const serviceRoleKey = () => read("SUPABASE_SERVICE_ROLE_KEY");
export const stripeSecretKey = () => read("STRIPE_SECRET_KEY");
export const stripeWebhookSecret = () => read("STRIPE_WEBHOOK_SECRET");
export const stripePriceTeam = () => read("STRIPE_PRICE_TEAM");

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function stripeBase(): string {
  return (read("STRIPE_API_BASE") || "https://api.stripe.com").replace(/\/+$/, "");
}
