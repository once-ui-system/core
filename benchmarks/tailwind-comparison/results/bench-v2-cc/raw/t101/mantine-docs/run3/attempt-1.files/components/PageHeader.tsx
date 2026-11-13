"use client";

import { Stack, Text, Title } from "@mantine/core";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={2} mb="md">
      <Title order={1}>{title}</Title>
      {description ? (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
