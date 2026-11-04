import type { Metadata } from "next";
import { Card, Stack, Text, Title } from "@mantine/core";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Reports
        </Title>
        <Text c="dimmed" mt={4}>
          A quick read on where issues are piling up.
        </Text>
      </div>
      <Card withBorder padding="lg" radius="md">
        <Title order={2} size="h4" mb="xs">
          Issue load
        </Title>
        <Text>
          There are {total} open issues across {projects.length} projects.{" "}
          {busiest.name} carries the most with {busiest.issues}.
        </Text>
      </Card>
    </Stack>
  );
}
