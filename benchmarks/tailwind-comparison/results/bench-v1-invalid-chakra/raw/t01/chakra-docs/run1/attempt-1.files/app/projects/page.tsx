import type { Metadata } from "next";
import { Badge, Box, Heading, Stack, Table, Text } from "@chakra-ui/react";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export default function ProjectsPage() {
  return (
    <Stack gap="6">
      <Box>
        <Heading as="h1" size="2xl">
          Projects
        </Heading>
        <Text color="fg.muted" mt="1">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Box>

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>
            Projects with their status, open issue count and last update date
          </Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Status</Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Open issues
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Updated
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell>
                  <Badge variant="surface">{p.key}</Badge>
                </Table.Cell>
                <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell textAlign="end">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Stack>
  );
}
