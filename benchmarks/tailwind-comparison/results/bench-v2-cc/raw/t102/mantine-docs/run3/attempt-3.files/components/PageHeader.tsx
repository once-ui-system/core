import { Box, Text, Title } from "@mantine/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      mb="xl"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--mantine-spacing-md)",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <Box maw={640}>
        <Title order={1}>{title}</Title>
        <Text c="dimmed" mt="xs" size="lg">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  );
}
