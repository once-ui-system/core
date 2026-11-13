"use client";

import { Badge, Box, Input, Table, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Field } from "@/components/ui/field";
import { formatDate, projects, statusPalette } from "@/lib/data";

export default function ProjectsPage() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issues and last update."
      />

      <Field label="Filter projects" maxW={{ base: "full", sm: "sm" }} mb="4">
        <Input
          type="search"
          placeholder="Name, key or status"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>

      <Table.ScrollArea borderWidth="1px" borderRadius="l2" bg="bg.panel">
        <Table.Root aria-label="Projects" size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell fontFamily="mono" fontWeight="medium">
                  {p.key}
                </Table.Cell>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusPalette[p.status]} variant="subtle">
                    {p.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end" fontFamily="mono">
                  {p.issues}
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(p.updated)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <Box mt="3" aria-live="polite">
        <Text fontSize="sm" color="fg.muted">
          {visible.length === 0
            ? "No projects match this filter."
            : `Showing ${visible.length} of ${projects.length} projects.`}
        </Text>
      </Box>
    </>
  );
}
