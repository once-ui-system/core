import { Badge, Table } from "@chakra-ui/react"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, projects } from "@/lib/data"

export function ProjectsTable() {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="lg" bg="bg">
      <Table.Root size="md" interactive>
        <Table.Caption srOnly>Projects in the Lumen workspace</Table.Caption>
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
              <Table.Cell whiteSpace="nowrap">{formatDate(p.updated)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
