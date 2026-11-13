"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor, user } from "@/lib/data";

const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const activeCount = projects.filter((p) => p.status === "Active").length;
const pausedCount = projects.filter((p) => p.status === "Paused").length;
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

const cards = [
  { label: "Open issues", value: String(totalIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeCount), note: "Receiving updates" },
  { label: "Paused projects", value: String(pausedCount), note: "Mobile beta" },
  { label: "Last update", value: formatDate(latest[0].updated), note: latest[0].name },
];

export default function DashboardPage() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Welcome back, {user.name.split(" ")[0]}</Title>
        <Text c="dimmed" fz="sm">
          Here is where your workspace stands today.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
        {cards.map((card) => (
          <Card key={card.label}>
            <Text fz="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: 0.4 }}>
              {card.label}
            </Text>
            <Text
              fz={24}
              fw={600}
              mt={4}
              style={{ fontFamily: "var(--mantine-font-family-headings)", fontVariantNumeric: "tabular-nums" }}
            >
              {card.value}
            </Text>
            <Text fz="xs" c="dimmed">
              {card.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card padding={0}>
        <Group px="sm" py="xs" justify="space-between">
          <Title order={3}>Recently updated</Title>
        </Group>
        <Table.ScrollContainer minWidth={360}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {latest.slice(0, 4).map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{formatDate(p.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
