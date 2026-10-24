import { isSupabaseConfigured } from "./env";
import { createServerSupabase } from "./supabase/server";

export type Viewer = { id: string; email: string };

/** The signed-in user, or null when signed out or when Supabase is not configured. */
export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}
