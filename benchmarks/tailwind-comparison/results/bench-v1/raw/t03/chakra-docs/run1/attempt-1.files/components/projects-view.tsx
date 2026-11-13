import { Badge, Box, Heading, Table, Text } from "@chakra-ui/react";
import { formatDate, projects, statusColor } from "@/lib/data";

export function ProjectsView() {
  return (
    <Box>
      <Heading as="h1" size="2xl">
        Projects
      </Heading>
      <Text color="fg.muted" mt="1" mb="5">
        {projects.length} projects in your workspace.
      </Text>

      <Table.ScrollArea borderWidth="1px" rounded="md" bg="bg">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>Projects with status, open issues and last update</Table.Caption>
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
            {projects.map((project) => (
              <Table.Row key={project.key}>
                <Table.Cell fontFamily="mono" fontWeight="medium">
                  {project.key}
                </Table.Cell>
                <Table.Cell>{project.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[project.status]}>{project.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{project.issues}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(project.updated)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
