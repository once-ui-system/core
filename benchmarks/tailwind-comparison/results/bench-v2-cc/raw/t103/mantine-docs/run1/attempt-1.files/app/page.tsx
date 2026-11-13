"use client";

import { Box, Card, Container, Group, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { formatDate, projects, user } from "@/lib/data";

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const byIssues = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 4);
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1);

  const stats = [
    { label: "Projects", value: String(projects.length), note: "across your workspace" },
    { label: "Active projects", value: String(active), note: "currently in progress" },
    { label: "Open issues", value: String(openIssues), note: "in all projects" },
    { label: "Last activity", value: formatDate(latest.updated), note: `${latest.key} · ${latest.name}` },
  ];

  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Welcome back, {firstName}
          </Title>
          <Text c="dimmed" mt={4}>
            Here is the state of your workspace today.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.5}>
                {stat.label}
              </Text>
              <Text ff="heading" fw={700} fz={28} mt={6}>
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed" mt={2}>
                {stat.note}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Card>
          <Title order={2} size="h4" mb="md">
            Open issues by project
          </Title>
          <Stack gap="md">
            {byIssues.map((p) => (
              <Box key={p.key}>
                <Group justify="space-between" mb={6} wrap="nowrap">
                  <Text size="sm" fw={500} truncate>
                    <Text span ff="monospace" c="dimmed" mr="xs">
                      {p.key}
                    </Text>
                    {p.name}
                  </Text>
                  <Text size="sm" ff="monospace">
                    {p.issues}
                  </Text>
                </Group>
                <Progress
                  value={(p.issues / maxIssues) * 100}
                  aria-label={`${p.name}: ${p.issues} open issues`}
                />
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
