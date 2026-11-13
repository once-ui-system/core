import type { Metadata } from "next";
import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeading title="Reports" description="Where open issues are piling up." />
      <Card>
        <Title order={2} fz={22} mb="md">
          Open issues by project
        </Title>
        <Stack gap="lg">
          {projects.map((project) => {
            const share = total === 0 ? 0 : Math.round((project.issues / total) * 100);
            return (
              <div key={project.key}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>{project.name}</Text>
                  <Text c="dimmed" size="sm">
                    {project.issues} issues · {share}%
                  </Text>
                </Group>
                <Progress value={share} size="lg" aria-label={`${project.name}: ${share}% of open issues`} />
              </div>
            );
          })}
        </Stack>
      </Card>
    </>
  );
}
