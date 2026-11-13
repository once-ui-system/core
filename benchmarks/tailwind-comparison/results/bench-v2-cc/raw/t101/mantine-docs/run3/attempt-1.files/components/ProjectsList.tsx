"use client";

import { useState } from "react";
import { Card, Group, Select, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const statusOptions = ["All statuses", "Active", "Paused", "Archived"];

export function ProjectsList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All statuses");

  const needle = query.trim().toLowerCase();
  const visible = projects.filter((project) => {
    const matchesStatus = status === "All statuses" || project.status === status;
    const matchesQuery =
      needle === "" ||
      project.name.toLowerCase().includes(needle) ||
      project.key.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issue count and last update."
      />
      <Card>
        <Group gap="sm" mb="sm" align="flex-end">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={14} stroke={1.75} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 200px", maxWidth: 320 }}
          />
          <Select
            label="Status"
            data={statusOptions}
            value={status}
            onChange={(value) => setStatus(value ?? "All statuses")}
            allowDeselect={false}
            style={{ flex: "0 1 160px" }}
          />
        </Group>

        <Table.ScrollContainer minWidth={520}>
          <Table>
            <Table.Caption>
              Showing {visible.length} of {projects.length} projects
            </Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Key</Table.Th>
                <Table.Th scope="col">Project</Table.Th>
                <Table.Th scope="col">Status</Table.Th>
                <Table.Th scope="col" ta="right">
                  Open issues
                </Table.Th>
                <Table.Th scope="col">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text size="sm" c="dimmed" ta="center">
                      No projects match these filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                visible.map((project) => (
                  <Table.Tr key={project.key}>
                    <Table.Td fw={600}>{project.key}</Table.Td>
                    <Table.Td>{project.name}</Table.Td>
                    <Table.Td>
                      <ProjectStatusBadge status={project.status} />
                    </Table.Td>
                    <Table.Td ta="right">{project.issues}</Table.Td>
                    <Table.Td>{formatDate(project.updated)}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
