"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, SegmentedControl, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export function ProjectsTable() {
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
    <Card>
      <Group justify="space-between" mb="md" gap="sm">
        <TextInput
          aria-label="Search projects"
          placeholder="Search by name or key"
          leftSection={<IconSearch size={16} aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          w={{ base: "100%", sm: 280 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
          visibleFrom="sm"
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
          hiddenFrom="sm"
          fullWidth
        />
      </Group>
      <Table.ScrollContainer minWidth={520}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Caption>Projects in the Acme Labs workspace</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Key</Table.Th>
              <Table.Th scope="col">Name</Table.Th>
              <Table.Th scope="col">Status</Table.Th>
              <Table.Th scope="col" ta="right">
                Issues
              </Table.Th>
              <Table.Th scope="col">Updated</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((p) => (
              <Table.Tr key={p.key}>
                <Table.Td ff="monospace" fw={600}>
                  {p.key}
                </Table.Td>
                <Table.Td>{p.name}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor[p.status]} variant="light">
                    {p.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{p.issues}</Table.Td>
                <Table.Td>{formatDate(p.updated)}</Table.Td>
              </Table.Tr>
            ))}
            {rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="md">
                    No projects match your filters.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
