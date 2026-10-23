import { Column, Heading, Text } from "@once-ui-system/core";

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Column
      fillWidth
      gap="8"
      padding="24"
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading as="p" variant="display-strong-xs">
        {value}
      </Heading>
      {hint && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {hint}
        </Text>
      )}
    </Column>
  );
}
