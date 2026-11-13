"use client"

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Projects
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          {projects.length} projects in your workspace.
        </Text>
      </Stack>

      {/* Phones: one card per project */}
      <Stack
        as="ul"
        display={{ base: "flex", md: "none" }}
        gap="4"
        m="0"
        p="0"
        listStyleType="none"
      >
        {projects.map((project) => (
          <Card.Root as="li" key={project.key} size="lg">
            <Card.Body gap="3">
              <Flex align="center" justify="space-between" gap="3">
                <Heading as="h2" size="lg">
                  {project.name}
                </Heading>
                <Badge size="lg" colorPalette={statusPalette[project.status]}>
                  {project.status}
                </Badge>
              </Flex>
              <HStack gap="3" color="fg.muted" fontSize="sm" wrap="wrap">
                <Text fontWeight="semibold" color="fg">
                  {project.key}
                </Text>
                <Text>{project.issues} open issues</Text>
                <Text>Updated {formatDate(project.updated)}</Text>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>

      {/* Tablet and desktop: table */}
      <Card.Root display={{ base: "none", md: "block" }} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="lg" interactive>
            <Table.Caption srOnly>Projects in the Lumen workspace</Table.Caption>
            <Table.Header>
              <Table.Row bg="bg.muted">
                <Table.ColumnHeader px="6" py="4">
                  Key
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Project
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" textAlign="end">
                  Open issues
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Updated
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {projects.map((project) => (
                <Table.Row key={project.key}>
                  <Table.Cell px="6" py="5" fontWeight="semibold">
                    {project.key}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    {project.name}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    <Badge
                      size="lg"
                      colorPalette={statusPalette[project.status]}
                    >
                      {project.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px="6" py="5" textAlign="end">
                    {project.issues}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    {formatDate(project.updated)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Stack>
  )
}
