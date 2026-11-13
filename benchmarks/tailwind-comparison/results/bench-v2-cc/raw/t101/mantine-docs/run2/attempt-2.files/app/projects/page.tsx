"use client";

import { Badge, Card, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function Page() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Projects</Title>
        <Text size="sm" c="dimmed">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </div>
      <Card p={0}>
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover striped="even">
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
              {projects.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td fw={600} ff="monospace">
                    {p.key}
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
                  <Table.Td>
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
