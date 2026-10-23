import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey } from "./config";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey()!,
  );
}
