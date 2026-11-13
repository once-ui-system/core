import {
  Badge,
  Card,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconFolders, IconUsers, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { formatDate, members, projects, recentProjects, statusColor, user } from "@/lib/data";

export function DashboardScreen() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, icon: IconAlertCircle, color: "orange" },
    { label: "Active projects", value: activeProjects, icon: IconFolders, color: "indigo" },
    { label: "Active members", value: activeMembers, icon: IconUsers, color: "teal" },
    { label: "Pending invites", value: pendingInvites, icon: IconUserPlus, color: "blue" },
  ];

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Good to see you, {user.name.split(" ")[0]}
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          Here is how the Acme Labs workspace looks today. Press Ctrl+K (⌘K on a Mac) to jump anywhere.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} component="section" aria-label="Workspace summary">
        {stats.map((stat) => (
          <Card key={stat.label} withBorder padding="md">
            <Group wrap="nowrap">
              <ThemeIcon variant="light" size="xl" color={stat.color} radius="md">
                <stat.icon size={24} aria-hidden />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {stat.label}
                </Text>
                <Text fz={28} fw={700} lh={1.1}>
                  {stat.value}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="md" component="section" aria-labelledby="recent-heading">
          <Title order={2} size="h4" id="recent-heading" mb="sm">
            Recently updated projects
          </Title>
          <Stack gap="sm">
            {recentProjects.map((project) => (
              <Group key={project.key} justify="space-between" wrap="nowrap" gap="sm">
                <div style={{ minWidth: 0 }}>
                  <Text fw={500} truncate>
                    {project.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {project.key} · updated {formatDate(project.updated)}
                  </Text>
                </div>
                <Badge variant="light" color={statusColor(project.status)}>
                  {project.issues} open
                </Badge>
              </Group>
            ))}
          </Stack>
          <Text component={Link} href="/projects" size="sm" mt="md" display="inline-block" c="indigo">
            View all projects
          </Text>
        </Card>

        <Card withBorder padding="md" component="section" aria-labelledby="tips-heading">
          <Title order={2} size="h4" id="tips-heading" mb="sm">
            Command palette tips
          </Title>
          <List spacing="xs" size="sm">
            <List.Item>Type “inv” to find Invite member and add a teammate by email.</List.Item>
            <List.Item>Use the arrow keys to move the highlight and Enter to run a command.</List.Item>
            <List.Item>Pick a recent project to jump straight to the projects list.</List.Item>
            <List.Item>On a phone, tap the Search button in the header.</List.Item>
          </List>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
