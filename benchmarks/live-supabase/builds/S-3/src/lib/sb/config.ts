/**
 * Supabase and Upstash are optional: without env vars the app runs in demo
 * mode (no sign-in, no gating, no rate limiting) and must still build, dev,
 * and deploy. Gate every cloud code path through these checks instead of
 * letting a missing var throw.
 */
/**
 * The browser-safe key. Supabase calls it the publishable key now and the
 * anon key before; both names are read so an older .env keeps working. Must
 * be NEXT_PUBLIC_ so the client bundle can inline it.
 */
export function supabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The server-only key (secret key, formerly service role key). Never NEXT_PUBLIC_. */
export function supabaseSecretKey(): string | undefined {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabasePublishableKey());
}

export function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
