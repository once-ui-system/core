"use client";

import { useState } from "react";
import { Badge, Box, Card, Code, Container, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function Page() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) => q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
  );

  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Projects
          </Title>
          <Text c="dimmed" mt={4}>
            {projects.length} projects in this workspace.
          </Text>
        </Box>

        <TextInput
          label="Filter projects"
          placeholder="Name or key"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          maw={360}
        />

        <Card p={0}>
          <Table.ScrollContainer minWidth={560}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" aria-label="Projects">
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
                {rows.map((p) => (
                  <Table.Tr key={p.key}>
                    <Table.Td>
                      <Code>{p.key}</Code>
                    </Table.Td>
                    <Table.Td fw={500}>{p.name}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={statusColor[p.status]}>
                        {p.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right" ff="monospace">
                      {p.issues}
                    </Table.Td>
                    <Table.Td>
                      <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {rows.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">
                        No projects match &ldquo;{query}&rdquo;.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Stack>
    </Container>
  );
}
