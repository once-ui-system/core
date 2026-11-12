"use client";

import Link from "next/link";
import { Anchor, Card, Group, SimpleGrid, Table, Text, Title } from "@mantine/core";
import {
  activeProjects,
  archivedProjects,
  busiestProject,
  formatDate,
  latestProject,
  pausedProjects,
  projects,
  projectsByUpdated,
  totalOpenIssues,
  user,
  workspaceName,
} from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const cards = [
  {
    label: "Open issues",
    value: String(totalOpenIssues),
    note: `Across ${projects.length} projects`,
  },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: `${pausedProjects.length} paused, ${archivedProjects.length} archived`,
  },
  {
    label: "Busiest project",
    value: busiestProject.name,
    note: `${busiestProject.issues} open issues`,
  },
  {
    label: "Last updated",
    value: formatDate(latestProject.updated),
    note: latestProject.name,
  },
];

export function Dashboard() {
  const recent = projectsByUpdated.slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${workspaceName} has ${totalOpenIssues} open issues across ${activeProjects.length} active projects.`}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" mb="md">
        {cards.map((card) => (
          <Card key={card.label}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.04em">
              {card.label}
            </Text>
            <Text ff="heading" fz={24} fw={600} lh={1.2} mt={4}>
              {card.value}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {card.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card>
        <Group justify="space-between" mb="xs">
          <Title order={2}>Recently updated</Title>
          <Anchor component={Link} href="/projects" size="sm">
            All projects
          </Anchor>
        </Group>
        <Table.ScrollContainer minWidth={420}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recent.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td fw={600}>{project.key}</Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <ProjectStatusBadge status={project.status} />
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
