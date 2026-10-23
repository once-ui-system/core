import { isSupabaseConfigured } from "@/lib/sb/config";

export function DemoNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div
      role="status"
      className="border-b border-border bg-accent px-4 py-1.5 text-center text-xs text-accent-foreground"
    >
      Demo mode: Supabase is not configured, so sign-in is off and the data is sample data.
    </div>
  );
}
