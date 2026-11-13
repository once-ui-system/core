"use client";

import { Card, Stack, Table, Text, Title } from "@mantine/core";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Reports</Title>
        <Text c="dimmed" fz="sm">
          Saved analytics reports for your workspace.
        </Text>
      </div>
      <Card padding={0}>
        <Table.ScrollContainer minWidth={420}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Report</Table.Th>
                <Table.Th>Period</Table.Th>
                <Table.Th>Owner</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((r) => (
                <Table.Tr key={r.name}>
                  <Table.Td>{r.name}</Table.Td>
                  <Table.Td>{r.period}</Table.Td>
                  <Table.Td>{r.owner}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
