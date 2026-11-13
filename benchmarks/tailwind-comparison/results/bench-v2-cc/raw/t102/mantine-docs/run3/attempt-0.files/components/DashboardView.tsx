"use client";

import Link from "next/link";
import { Badge, Button, Card, Group, Progress, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBug, IconFolders, IconPlayerPause, IconSparkles } from "@tabler/icons-react";
import { formatDate, projects, statusColor, user } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function DashboardView() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1);
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(totalIssues), hint: `Across ${projects.length} projects`, icon: IconBug },
    { label: "Active projects", value: String(active), hint: "Shipping this month", icon: IconFolders },
    { label: "Paused", value: String(paused), hint: "Waiting for a restart", icon: IconPlayerPause },
    { label: "Latest update", value: latest.key, hint: `${latest.name}, ${formatDate(latest.updated)}`, icon: IconSparkles },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        description="Here is how your team is doing across every project today."
        actions={
          <Button component={Link} href="/projects">
            View projects
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg" mb="xl">
        {cards.map((card) => (
          <Card key={card.label} component="section" aria-label={card.label}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={600} c="dimmed">
                {card.label}
              </Text>
              <ThemeIcon variant="light" size={44} radius="md">
                <card.icon size={22} stroke={1.75} aria-hidden />
              </ThemeIcon>
            </Group>
            <Text ff="heading" fw={800} fz={40} lh={1.1} mt="md">
              {card.value}
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              {card.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card component="section" aria-labelledby="busiest-heading">
        <Text id="busiest-heading" ff="heading" fw={700} fz="xl" mb="lg">
          Where the work is
        </Text>
        <Stack gap="lg">
          {projects.map((p) => (
            <div key={p.key}>
              <Group justify="space-between" mb={6} wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Text fw={600}>{p.name}</Text>
                  <Badge variant="light" color={statusColor[p.status]}>
                    {p.status}
                  </Badge>
                </Group>
                <Text fw={600}>{p.issues} open</Text>
              </Group>
              <Progress value={(p.issues / maxIssues) * 100} size="md" aria-label={`${p.name}: ${p.issues} open issues`} />
            </div>
          ))}
        </Stack>
      </Card>
    </>
  );
}
