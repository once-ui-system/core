"use client";

import { Badge, Card, Table, Text } from "@mantine/core";
import { formatDate, projects, statusColor } from "@/lib/data";

export function ProjectsTable() {
  return (
    <Card withBorder padding={0} radius="md">
      <Table.ScrollContainer minWidth={560}>
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          tabularNums
        >
          <Table.Caption>Projects and their open issue counts</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Key</Table.Th>
              <Table.Th scope="col">Name</Table.Th>
              <Table.Th scope="col">Status</Table.Th>
              <Table.Th scope="col" ta="right">
                Open issues
              </Table.Th>
              <Table.Th scope="col">Last updated</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects.map((project) => (
              <Table.Tr key={project.key}>
                <Table.Td>
                  <Text ff="monospace" fw={600} size="sm">
                    {project.key}
                  </Text>
                </Table.Td>
                <Table.Td>{project.name}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor[project.status]} variant="light">
                    {project.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{project.issues}</Table.Td>
                <Table.Td>
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
