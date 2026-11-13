"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor, type Project } from "../lib/data";

export function ProjectsScreen() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Projects
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {projects.length} projects across the Acme Labs workspace.
        </Text>
      </div>

      {/* Table on larger screens */}
      <Card withBorder padding={0} visibleFrom="sm">
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Caption>All Lumen projects with status, open issues and last update</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Key</Table.Th>
                <Table.Th scope="col">Name</Table.Th>
                <Table.Th scope="col">Status</Table.Th>
                <Table.Th scope="col" ta="right">
                  Open issues
                </Table.Th>
                <Table.Th scope="col">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {projects.map((project: Project) => (
                <Table.Tr key={project.key}>
                  <Table.Td>
                    <Text fw={600} size="sm" ff="monospace">
                      {project.key}
                    </Text>
                  </Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* Cards on phones */}
      <SimpleGrid cols={1} hiddenFrom="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {projects.map((project: Project) => (
          <li key={project.key}>
            <Card withBorder padding="md">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <div style={{ minWidth: 0 }}>
                  <Text fw={600} truncate>
                    {project.name}
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {project.key}
                  </Text>
                </div>
                <Badge variant="light" color={statusColor(project.status)}>
                  {project.status}
                </Badge>
              </Group>
              <Group justify="space-between" mt="sm">
                <Text size="sm">{project.issues} open issues</Text>
                <Text size="xs" c="dimmed">
                  Updated {formatDate(project.updated)}
                </Text>
              </Group>
            </Card>
          </li>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
