"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Code, Group, SegmentedControl, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Projects</Title>
        <Text c="dimmed" fz="sm">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </div>

      <Group gap="sm">
        <TextInput
          aria-label="Search projects"
          placeholder="Search by name or key"
          leftSection={<IconSearch size={14} aria-hidden />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 200px", maxWidth: 320 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
        />
      </Group>

      <Card padding={0}>
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover stickyHeader>
            <Table.Caption>Projects with status, open issues and last update</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Issues</Table.Th>
                <Table.Th ta="right">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>
                    <Code>{p.key}</Code>
                  </Table.Td>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.issues}
                  </Table.Td>
                  <Table.Td ta="right">{formatDate(p.updated)}</Table.Td>
                </Table.Tr>
              ))}
              {rows.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center" fz="sm">
                      No projects match your filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
