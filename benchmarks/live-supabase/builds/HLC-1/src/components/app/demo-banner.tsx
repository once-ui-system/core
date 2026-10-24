import { isSupabaseConfigured } from "@/lib/env";

export function DemoBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <p className="mb-6 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
      Demo data. Supabase is not configured, so nothing you change here is saved.
    </p>
  );
}
