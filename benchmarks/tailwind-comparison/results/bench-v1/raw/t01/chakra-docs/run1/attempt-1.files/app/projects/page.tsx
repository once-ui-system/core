import { Badge, Box, Table, Text } from "@chakra-ui/react"
import { PageHeading } from "@/components/page-heading"
import { formatDate, projects, statusPalette } from "@/lib/data"

export const metadata = { title: "Projects · Lumen" }

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in your workspace.`}
      />

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root size="md" variant="line" interactive>
          <Table.Caption srOnly>
            Projects with their status, open issue count and last update
          </Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Project</Table.ColumnHeader>
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
            {projects.map((project) => (
              <Table.Row key={project.key}>
                <Table.Cell>
                  <Box as="code" fontSize="sm" fontWeight="semibold">
                    {project.key}
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{project.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusPalette[project.status]}>
                    {project.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{project.issues}</Table.Cell>
                <Table.Cell textAlign="end" whiteSpace="nowrap">
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
