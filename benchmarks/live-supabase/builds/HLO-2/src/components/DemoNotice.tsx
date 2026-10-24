import { Column, Text } from "@once-ui-system/core";

// Shown wherever the app runs without Supabase variables (demo mode).
export function DemoNotice() {
  return (
    <Column background="surface" border radius="m" padding="16" gap="4">
      <Text variant="label-strong-s">Demo mode</Text>
      <Text variant="body-default-s" onBackground="neutral-medium">
        Supabase is not configured. Sign-in is off and the workspace shows sample data.
      </Text>
    </Column>
  );
}
