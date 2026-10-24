// Environment is read through a computed key at runtime, so Next does not inline
// the values at build time. The same build runs in demo mode or against a live project.
export function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function supabaseUrl(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseAnonKey(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Demo mode when the URL or anon key is missing: no auth gating, sample data. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}
