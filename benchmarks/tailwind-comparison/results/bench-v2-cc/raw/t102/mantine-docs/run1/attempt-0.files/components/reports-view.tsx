"use client";

import { Badge, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/page-header";
import { projects } from "@/lib/data";

const ranked = [...projects].sort((a, b) => b.issues - a.issues);
const maxIssues = Math.max(...projects.map((p) => p.issues), 1);

export function ReportsView() {
  return (
    <Stack gap="xl">
      <PageHeader
        title="Reports"
        description="See where open issues are piling up, so the team knows where to lend a hand."
      />

      <Card component="section" aria-labelledby="issues-heading">
        <Title order={2} id="issues-heading" mb="lg">
          Open issues by project
        </Title>
        <Stack gap="lg">
          {ranked.map((project) => (
            <Stack key={project.key} gap={8}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Badge variant="light" color="sand.9">
                    {project.key}
                  </Badge>
                  <Text fw={700}>{project.name}</Text>
                </Group>
                <Text fw={700}>{project.issues}</Text>
              </Group>
              <Progress
                value={(project.issues / maxIssues) * 100}
                size="lg"
                aria-label={`${project.name}: ${project.issues} open issues`}
              />
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
