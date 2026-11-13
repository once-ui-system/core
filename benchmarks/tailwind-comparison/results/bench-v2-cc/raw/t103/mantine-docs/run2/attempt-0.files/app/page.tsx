"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeCount = projects.filter((p) => p.status === "Active").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const stats = [
    { label: "Open issues", value: String(totalIssues), hint: `across ${projects.length} projects` },
    { label: "Active projects", value: String(activeCount), hint: "currently in development" },
    { label: "Busiest project", value: busiest.key, hint: `${busiest.name}, ${busiest.issues} issues` },
    { label: "Last activity", value: formatDate(recent[0].updated), hint: recent[0].name },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} component="section" aria-label="Summary">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
              {stat.label}
            </Text>
            <Text ff="heading" fz={28} fw={600} mt={4}>
              {stat.value}
            </Text>
            <Text size="sm" c="dimmed">
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
      <Card component="section" aria-labelledby="recent-heading">
        <Title order={2} id="recent-heading" mb="sm">
          Recently updated
        </Title>
        <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
          {recent.map((p) => (
            <li key={p.key}>
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <Text ff="monospace" fw={600} size="sm" w={44}>
                    {p.key}
                  </Text>
                  <Text truncate>{p.name}</Text>
                </Group>
                <Group gap="sm" wrap="nowrap">
                  <Text size="sm" c="dimmed" visibleFrom="xs">
                    {formatDate(p.updated)}
                  </Text>
                  <Badge color={statusColor[p.status]} variant="light">
                    {p.status}
                  </Badge>
                </Group>
              </Group>
            </li>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
