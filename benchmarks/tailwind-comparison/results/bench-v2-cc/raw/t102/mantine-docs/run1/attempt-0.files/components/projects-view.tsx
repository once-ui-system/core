"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, Select, Stack, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, string> = {
  Active: "teal.9",
  Paused: "orange.9",
  Archived: "sand.9",
};

const statusOptions = ["All statuses", "Active", "Paused", "Archived"];

export function ProjectsView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All statuses");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery = q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <Stack gap="xl">
      <PageHeader
        title="Projects"
        description="Every project your team is shipping, with its open issues and latest activity."
      />

      <Card component="section" aria-label="Project list">
        <Group align="flex-end" gap="md" mb="lg">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px" }}
          />
          <Select
            label="Status"
            data={statusOptions}
            value={status}
            onChange={(value) => setStatus(value ?? "All statuses")}
            style={{ flex: "0 1 220px" }}
          />
        </Group>

        <Table.ScrollContainer minWidth={560}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Open issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td>
                    <Group gap="md" wrap="nowrap">
                      <Badge variant="light" color="sand.9">
                        {project.key}
                      </Badge>
                      <Text fw={700}>{project.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[project.status]}>
                      {project.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Text fz="sm" c="dimmed" mt="md" role="status" aria-live="polite">
          {visible.length === 0
            ? "No projects match your search. Try a different name or status."
            : `Showing ${visible.length} of ${projects.length} projects`}
        </Text>
      </Card>
    </Stack>
  );
}
