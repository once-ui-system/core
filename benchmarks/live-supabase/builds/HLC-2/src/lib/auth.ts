import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Viewer = { id: string; email: string; demo: boolean };

const DEMO_VIEWER: Viewer = { id: "demo-user", email: "demo@acme-notes.example", demo: true };

/** The signed-in user. In demo mode (no Supabase) every visitor is the demo user. */
export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return DEMO_VIEWER;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "", demo: false };
}

/** Only relative, same-site paths may be used as a post-login destination. */
export function safeNext(next: FormDataEntryValue | string | null | undefined, fallback = "/app"): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
