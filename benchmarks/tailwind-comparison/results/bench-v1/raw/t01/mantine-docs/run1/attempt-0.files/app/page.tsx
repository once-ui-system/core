import type { Metadata } from "next";
import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBug,
  IconFolders,
  IconPlayerPause,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { AppFrame } from "@/components/AppFrame";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const cards = [
    {
      label: "Active projects",
      value: active,
      hint: `${projects.length} projects in total`,
      icon: IconFolders,
      color: "teal",
    },
    {
      label: "Open issues",
      value: openIssues,
      hint: "Across all projects",
      icon: IconBug,
      color: "indigo",
    },
    {
      label: "Paused projects",
      value: paused,
      hint: "Mobile beta is on hold",
      icon: IconPlayerPause,
      color: "yellow",
    },
    {
      label: "Team members",
      value: 6,
      hint: "You are the workspace owner",
      icon: IconUsers,
      color: "cyan",
    },
  ];

  return (
    <AppFrame>
      <Stack gap="xl">
        <div>
          <Title order={1} size="h2">
            Welcome back, {user.name.split(" ")[0]}
          </Title>
          <Text c="dimmed" mt={4}>
            Here is where things stand across your workspace today.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
          {cards.map((card) => (
            <Card key={card.label} withBorder padding="lg" radius="md">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <div>
                  <Text size="sm" c="dimmed">
                    {card.label}
                  </Text>
                  <Text fz={32} fw={700} lh={1.2} mt={4}>
                    {card.value}
                  </Text>
                </div>
                <ThemeIcon variant="light" color={card.color} size={40} radius="md">
                  <card.icon size={22} aria-hidden />
                </ThemeIcon>
              </Group>
              <Text size="xs" c="dimmed" mt="sm">
                {card.hint}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={2} size="h4">
              Recently updated
            </Title>
            <Text component={Link} href="/projects" size="sm" c="indigo.7">
              View all projects
            </Text>
          </Group>
          <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {recent.map((project) => (
              <li key={project.key}>
                <Group justify="space-between" wrap="nowrap">
                  <div>
                    <Text fw={600}>
                      {project.name}{" "}
                      <Text span c="dimmed" size="sm">
                        ({project.key})
                      </Text>
                    </Text>
                    <Text size="sm" c="dimmed">
                      Updated {formatDate(project.updated)} · {project.issues} open issues
                    </Text>
                  </div>
                  <Badge color={statusColor[project.status]} variant="light">
                    {project.status}
                  </Badge>
                </Group>
              </li>
            ))}
          </Stack>
        </Card>
      </Stack>
    </AppFrame>
  );
}
