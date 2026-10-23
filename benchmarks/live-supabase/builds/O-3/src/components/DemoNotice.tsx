import { Row, Text } from "@once-ui-system/core";
import { isSupabaseConfigured } from "@/lib/env";

export function DemoNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <Row fillWidth horizontal="center" paddingX="16" paddingY="8" background="brand-alpha-weak">
      <Text variant="label-default-s" onBackground="brand-strong">
        Demo mode: Supabase is not configured, so sign-in is off and the data is sample data.
      </Text>
    </Row>
  );
}
