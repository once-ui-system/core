import { Box, Text, Title } from "@mantine/core";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Box mb="lg">
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" mt={4}>
          {description}
        </Text>
      )}
    </Box>
  );
}
