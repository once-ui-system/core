"use client";

import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { projects, user, formatDate } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = projects.map((p) => p.updated).sort().at(-1) ?? projects[0].updated;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const cards = [
    { label: "Active projects", value: String(active), note: `${projects.length} in the workspace` },
    { label: "Open issues", value: String(openIssues), note: `Most in ${busiest.name} (${busiest.issues})` },
    { label: "Paused projects", value: String(paused), note: "Mobile beta is on hold" },
    { label: "Last update", value: formatDate(latest), note: "Customer app" },
  ];

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Welcome back, {user.name.split(" ")[0]}</Title>
        <Text size="sm" c="dimmed">
          Here is where your workspace stands today.
        </Text>
      </div>
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="sm">
        {cards.map((c) => (
          <Card key={c.label}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
              {c.label}
            </Text>
            <Text ff="heading" fz={26} fw={600} mt={4} lh={1.2}>
              {c.value}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {c.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
