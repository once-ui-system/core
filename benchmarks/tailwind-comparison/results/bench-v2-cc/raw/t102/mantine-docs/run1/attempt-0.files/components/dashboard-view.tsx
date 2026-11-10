"use client";

import Link from "next/link";
import { Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconActivity, IconBug, IconCalendarEvent, IconFolders, type Icon } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { firstName, formatDate, projects } from "@/lib/data";

interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: Icon;
}

const byUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
const byIssues = [...projects].sort((a, b) => b.issues - a.issues);
const activeCount = projects.filter((p) => p.status === "Active").length;
const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);

const stats: Stat[] = [
  {
    label: "Active projects",
    value: String(activeCount),
    hint: `${projects.length} projects in total`,
    icon: IconFolders,
  },
  {
    label: "Open issues",
    value: String(totalIssues),
    hint: "Across every project",
    icon: IconBug,
  },
  {
    label: "Busiest project",
    value: byIssues[0].name,
    hint: `${byIssues[0].issues} open issues`,
    icon: IconActivity,
  },
  {
    label: "Last update",
    value: formatDate(byUpdated[0].updated),
    hint: byUpdated[0].name,
    icon: IconCalendarEvent,
  },
];

export function DashboardView() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here is how your ${projects.length} projects are doing today. Nice work, team.`}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Card key={stat.label} component="section" aria-label={stat.label}>
            <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
              <Text fw={600} c="dimmed">
                {stat.label}
              </Text>
              <ThemeIcon size={44} variant="light" color="brand" aria-hidden>
                <stat.icon size={24} />
              </ThemeIcon>
            </Group>
            <Text ff="heading" fw={800} fz={stat.value.length > 8 ? 26 : 36} lh={1.2}>
              {stat.value}
            </Text>
            <Text fz="sm" c="dimmed" mt={6}>
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card component="section" aria-labelledby="recent-heading">
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} id="recent-heading">
            Recently updated
          </Title>
          <Button component={Link} href="/projects" variant="light">
            View all projects
          </Button>
        </Group>
        <Stack component="ul" gap={0} p={0} m={0} style={{ listStyle: "none" }}>
          {byUpdated.slice(0, 3).map((project, index) => (
            <Box
              key={project.key}
              component="li"
              py="md"
              style={
                index > 0 ? { borderTop: "1px solid var(--mantine-color-default-border)" } : undefined
              }
            >
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Group gap="md" wrap="nowrap" miw={0}>
                  <Badge variant="light" color="sand.9">
                    {project.key}
                  </Badge>
                  <Box miw={0}>
                    <Text fw={700} truncate>
                      {project.name}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {project.issues} open issues
                    </Text>
                  </Box>
                </Group>
                <Text fz="sm" c="dimmed" ta="right">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
