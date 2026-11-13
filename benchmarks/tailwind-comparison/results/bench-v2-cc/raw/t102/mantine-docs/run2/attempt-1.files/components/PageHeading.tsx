import { Stack, Text, Title } from "@mantine/core";

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={4} mb="lg">
      <Title order={1} fz={{ base: 28, sm: 34 }}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" size="lg">
          {description}
        </Text>
      )}
    </Stack>
  );
}
