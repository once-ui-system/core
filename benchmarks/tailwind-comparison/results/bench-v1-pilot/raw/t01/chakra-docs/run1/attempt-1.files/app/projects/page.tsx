import { Badge, Box, Table } from "@chakra-ui/react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Box bg="bg" rounded="lg" borderWidth="1px" borderColor="border" overflow="hidden">
        <Table.ScrollArea>
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
                    <Badge variant="outline" fontFamily="mono">
                      {p.key}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={p.status} />
                  </Table.Cell>
                  <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                  <Table.Cell textAlign="end" whiteSpace="nowrap">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </>
  );
}
