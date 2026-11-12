import type { Metadata } from "next";
import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconBug, IconCircleCheck, IconClockPause, IconFolders } from "@tabler/icons-react";
import { LinkAnchor } from "@/components/LinkAnchor";
import { PageHeading } from "@/components/PageHeading";
import { SummaryCard } from "@/components/SummaryCard";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}!`}
        description="Here is how your team is doing across all projects today."
      />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <SummaryCard
          label="Open issues"
          value={String(openIssues)}
          hint="Across every project"
          icon={<IconBug size={26} />}
        />
        <SummaryCard
          label="Active projects"
          value={String(active)}
          hint="Shipping right now"
          icon={<IconCircleCheck size={26} />}
        />
        <SummaryCard
          label="Paused"
          value={String(paused)}
          hint="Waiting for a restart"
          icon={<IconClockPause size={26} />}
        />
        <SummaryCard
          label="Projects"
          value={String(projects.length)}
          hint="Including archived"
          icon={<IconFolders size={26} />}
        />
      </SimpleGrid>

      <Card mt="lg">
        <Group justify="space-between" mb="md">
          <Title order={2} fz={22}>
            Recently updated
          </Title>
          <LinkAnchor href="/projects">View all projects</LinkAnchor>
        </Group>
        <Stack gap="md">
          {recent.map((project) => (
            <Group key={project.key} justify="space-between" wrap="wrap" gap="sm">
              <div>
                <Text fw={600}>
                  {project.name}{" "}
                  <Text span c="dimmed" fw={500}>
                    {project.key}
                  </Text>
                </Text>
                <Text size="sm" c="dimmed">
                  Updated {formatDate(project.updated)} · {project.issues} open issues
                </Text>
              </div>
              <Badge color={statusColor[project.status]}>{project.status}</Badge>
            </Group>
          ))}
        </Stack>
      </Card>
    </>
  );
}
