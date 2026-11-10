"use client";

import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const ranked = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <>
      <PageHeading
        title="Reports"
        description="Where open issues are concentrated, so you can decide where to spend the next sprint."
      />
      <Card component="section" aria-labelledby="share-heading">
        <Title order={2} id="share-heading" mb="md">
          Open issues by project
        </Title>
        <Stack gap="md">
          {ranked.map((project) => {
            const share = total === 0 ? 0 : Math.round((project.issues / total) * 100);
            return (
              <div key={project.key}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">
                    <Text span ff="monospace" fw={600}>
                      {project.key}
                    </Text>{" "}
                    {project.name}
                  </Text>
                  <Text size="sm" c="dimmed" ff="monospace">
                    {project.issues} ({share}%)
                  </Text>
                </Group>
                <Progress value={share} aria-label={`${project.name}: ${share}% of open issues`} />
              </div>
            );
          })}
        </Stack>
      </Card>
    </>
  );
}
