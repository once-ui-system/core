"use client"

import { Badge, Box, Heading, Stack, Table, Text } from "@chakra-ui/react"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  return (
    <Stack gap="8">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Projects
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          {projects.length} projects in your workspace, from the marketing site to internal tools.
        </Text>
      </Stack>

      <Box bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="l3" p={{ base: "2", md: "4" }}>
        <Table.ScrollArea borderRadius="l2">
          <Table.Root size="lg" interactive>
            <Table.Caption srOnly>All Lumen projects with status, open issues and last update</Table.Caption>
            <Table.Header>
              <Table.Row bg="transparent">
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Issues</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {projects.map((p) => (
                <Table.Row key={p.key} bg="transparent">
                  <Table.Cell fontWeight="bold" fontFamily="mono" color="brand.fg">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="semibold">{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="md">
                      {p.status}
                    </Badge>
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
    </Stack>
  )
}
