import { isSupabaseConfigured } from "@/lib/env";

export function DemoNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div
      role="status"
      className="border-b bg-accent/40 px-4 py-1.5 text-center text-xs text-accent-foreground"
    >
      Demo mode: Supabase is not configured, so sign-in is off and sample data is shown.
    </div>
  );
}
