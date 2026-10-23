import { Row, Text } from "@once-ui-system/core";
import { isSupabaseConfigured } from "../lib/supabase/config";

export function SupabaseNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <Row background="surface" border radius="m" paddingX="16" paddingY="8" role="status">
      <Text variant="body-default-s" onBackground="neutral-weak">
        Demo mode: Supabase is not configured, so sign-in is off and the data shown is sample data.
      </Text>
    </Row>
  );
}
