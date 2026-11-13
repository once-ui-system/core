"use client";

import { Card, Group, Progress, SimpleGrid, Stack, Text } from "@mantine/core";
import { projects, statusColor } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function ReportsView() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const statuses = (["Active", "Paused", "Archived"] as const).map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
    issues: projects.filter((p) => p.status === status).reduce((s, p) => s + p.issues, 0),
  }));

  return (
    <>
      <PageHeader
        title="Reports"
        description="A simple look at where issues are piling up and which projects carry them."
      />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card component="section" aria-labelledby="by-project">
          <Text id="by-project" ff="heading" fw={700} fz="xl" mb="lg">
            Issues by project
          </Text>
          <Stack gap="lg">
            {projects.map((p) => (
              <div key={p.key}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>{p.name}</Text>
                  <Text fw={600}>{p.issues}</Text>
                </Group>
                <Progress
                  value={total ? (p.issues / total) * 100 : 0}
                  size="md"
                  aria-label={`${p.name}: ${p.issues} of ${total} open issues`}
                />
              </div>
            ))}
          </Stack>
        </Card>
        <Card component="section" aria-labelledby="by-status">
          <Text id="by-status" ff="heading" fw={700} fz="xl" mb="lg">
            Issues by status
          </Text>
          <Stack gap="lg">
            {statuses.map((s) => (
              <div key={s.status}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>
                    {s.status} ({s.count} {s.count === 1 ? "project" : "projects"})
                  </Text>
                  <Text fw={600}>{s.issues} issues</Text>
                </Group>
                <Progress
                  value={total ? (s.issues / total) * 100 : 0}
                  color={statusColor[s.status]}
                  size="md"
                  aria-label={`${s.status}: ${s.issues} of ${total} open issues`}
                />
              </div>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}
