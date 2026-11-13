import { Badge, Table, Text } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>Projects with status, open issues and last update</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Status</Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Open issues
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell fontFamily="mono" fontSize="sm">
                  {p.key}
                </Table.Cell>
                <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell>
                  <Text as="time" dateTime={p.updated} whiteSpace="nowrap">
                    {formatDate(p.updated)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </AppShell>
  );
}
