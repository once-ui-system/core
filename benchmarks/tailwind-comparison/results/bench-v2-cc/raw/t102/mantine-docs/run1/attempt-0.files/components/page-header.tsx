import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={6}>
        <Title order={1}>{title}</Title>
        <Text c="dimmed" fz="lg" maw={560}>
          {description}
        </Text>
      </Stack>
      {action}
    </Group>
  );
}
