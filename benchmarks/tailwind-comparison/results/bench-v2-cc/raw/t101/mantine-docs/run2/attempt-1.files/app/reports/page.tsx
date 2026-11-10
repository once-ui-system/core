"use client";

import { Card, Stack, Table, Text, Title } from "@mantine/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Reports</Title>
        <Text size="sm" c="dimmed">
          Open issues by project, {total} in total.
        </Text>
      </div>
      <Card p={0}>
        <Table.ScrollContainer minWidth={360}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Project</Table.Th>
                <Table.Th scope="col" ta="right">
                  Open issues
                </Table.Th>
                <Table.Th scope="col" ta="right">
                  Share
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {projects.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td ta="right">{p.issues}</Table.Td>
                  <Table.Td ta="right">{total ? Math.round((p.issues / total) * 100) : 0}%</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
