import { Row, Text } from "@once-ui-system/core";

/** Shown while Supabase is not configured. */
export function DemoNotice() {
  return (
    <Row fillWidth paddingX="16" paddingY="12" background="surface" border radius="m" align="center">
      <Text variant="body-default-s" onBackground="neutral-medium">
        Supabase is not configured, so the app runs in demo mode: sign-in is off and nothing is saved.
      </Text>
    </Row>
  );
}
