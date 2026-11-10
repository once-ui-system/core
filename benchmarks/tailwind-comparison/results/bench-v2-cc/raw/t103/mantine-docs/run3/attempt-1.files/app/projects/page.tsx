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
      <PageHeading title="Projects" description="Every project in the Acme Labs workspace, with its open issue count." />

      <Group mb="md" gap="md" align="flex-end">
        <TextInput
          label="Search projects"
          placeholder="Name or key"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 220px", maxWidth: 360 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
        />
      </Group>

      <Card p={0}>
        <Table.ScrollContainer minWidth={560}>
          <Table>
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
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td ff="monospace" fw={600}>
                    {project.key}
                  </Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[project.status]}>{project.status}</Badge>
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {project.issues}
                  </Table.Td>
                  <Table.Td>
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {visible.length === 0 && (
          <Text c="dimmed" ta="center" py="lg" role="status">
            No projects match your filters.
          </Text>
        )}
      </Card>
    </>
  );
}
