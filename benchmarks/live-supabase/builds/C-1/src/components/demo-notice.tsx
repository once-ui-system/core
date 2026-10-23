import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div
      role="status"
      className="fixed bottom-3 right-3 z-50 max-w-xs rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground shadow-lg"
    >
      Demo mode: Supabase is not configured, so sign-in is off and data is sample data.
    </div>
  );
}
