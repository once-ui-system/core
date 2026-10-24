import { Column, Text } from "@once-ui-system/core";
import { isSupabaseConfigured } from "@/lib/env";

/** Shown in demo mode so nobody mistakes the sample pages for a live account. */
export function SupabaseNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <Column fillWidth background="surface" border radius="m" padding="16" role="status">
      <Text variant="body-default-s" onBackground="neutral-medium">
        Supabase is not configured, so the app runs in demo mode. Sign-in and organizations are
        off until the variables in .env.example are set.
      </Text>
    </Column>
  );
}
