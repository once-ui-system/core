import { Column, Text } from "@once-ui-system/core";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Column background="surface" border radius="l" padding="24" gap="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-xs" onBackground="neutral-strong">
        {value}
      </Text>
    </Column>
  );
}
