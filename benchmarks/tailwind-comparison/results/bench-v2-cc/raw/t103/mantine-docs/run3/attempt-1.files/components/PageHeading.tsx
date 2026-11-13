"use client";

import { Stack, Text, Title } from "@mantine/core";

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={4} mb="lg">
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" maw={640}>
          {description}
        </Text>
      )}
    </Stack>
  );
}
