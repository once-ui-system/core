"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, SegmentedControl, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PageHeading } from "@/components/PageHeading";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <>
      <PageHeading title="Projects" description="Every project your team tracks in Lumen." />
      <Card>
        <Group justify="space-between" mb="lg" gap="md">
          <TextInput
            placeholder="Search by name or key"
            aria-label="Search projects"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px", maxWidth: 380 }}
          />
          <SegmentedControl
            data={filters}
            value={status}
            onChange={setStatus}
            aria-label="Filter by status"
          />
        </Group>
        <Table.ScrollContainer minWidth={560}>
          <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Open issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td fw={600}>{project.key}</Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[project.status]}>{project.status}</Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {visible.length === 0 && (
          <Text ta="center" c="dimmed" py="xl" role="status">
            No projects match your search. Try a different name or status.
          </Text>
        )}
      </Card>
    </>
  );
}
