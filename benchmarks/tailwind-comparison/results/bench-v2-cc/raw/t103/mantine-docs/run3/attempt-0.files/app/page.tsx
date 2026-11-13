"use client";

import Link from "next/link";
import { Anchor, Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const stats = [
    { label: "Open issues", value: openIssues, hint: "across all projects" },
    { label: "Active projects", value: active, hint: `of ${projects.length} in the workspace` },
    { label: "Paused projects", value: paused, hint: "waiting on a restart" },
    { label: "Latest update", value: formatDate(recent[0].updated), hint: recent[0].name },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your team's projects stand today."
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" component="section" aria-label="Summary">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" ff="monospace" style={{ letterSpacing: "0.04em" }}>
              {stat.label}
            </Text>
            <Text ff="monospace" fw={700} fz={{ base: 28, sm: 30 }} mt={4}>
              {stat.value}
            </Text>
            <Text size="sm" c="dimmed">
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card mt="md" component="section" aria-labelledby="recent-heading">
        <Group justify="space-between" mb="sm">
          <Title order={2} id="recent-heading">
            Recently updated
          </Title>
          <Anchor component={Link} href="/projects" size="sm">
            View all projects
          </Anchor>
        </Group>
        <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
          {recent.map((project) => (
            <Group key={project.key} component="li" justify="space-between" wrap="nowrap" gap="sm">
              <Group gap="sm" wrap="nowrap" miw={0}>
                <Text ff="monospace" fw={600} size="sm" w={44}>
                  {project.key}
                </Text>
                <Text truncate>{project.name}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <Badge color={statusColor[project.status]} visibleFrom="xs">
                  {project.status}
                </Badge>
                <Text size="sm" c="dimmed" component="time" dateTime={project.updated}>
                  {formatDate(project.updated)}
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>
      </Card>
    </>
  );
}
