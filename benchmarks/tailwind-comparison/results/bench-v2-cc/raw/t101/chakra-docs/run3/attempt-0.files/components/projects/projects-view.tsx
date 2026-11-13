"use client"

import { PageHeader } from "@/components/page-header"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { type ProjectStatus, projects } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Badge, Flex, Input, Table, Text } from "@chakra-ui/react"
import { useState } from "react"
import { LuSearch } from "react-icons/lu"

const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
]

export function ProjectsView() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const needle = query.trim().toLowerCase()
  const rows = projects.filter((project) => {
    const matchesStatus = status === "all" || project.status === status
    const matchesText =
      needle === "" ||
      project.name.toLowerCase().includes(needle) ||
      project.key.toLowerCase().includes(needle)
    return matchesStatus && matchesText
  })

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace, with its open issues and last update."
      />

      <Flex direction={{ base: "column", sm: "row" }} gap="2" mb="3" align={{ sm: "center" }}>
        <InputGroup flex="1" maxW={{ sm: "xs" }} startElement={<LuSearch aria-hidden />}>
          <Input
            aria-label="Filter projects by name or key"
            placeholder="Filter by name or key"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <NativeSelectRoot w={{ base: "100%", sm: "44" }}>
          <NativeSelectField
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value)}
            items={statusOptions}
          />
        </NativeSelectRoot>
        <Text
          role="status"
          aria-live="polite"
          fontSize="xs"
          color="fg.muted"
          ms={{ sm: "auto" }}
        >
          Showing {rows.length} of {projects.length} projects
        </Text>
      </Flex>

      <Table.ScrollArea borderWidth="1px" borderRadius="l2">
        <Table.Root size="sm" variant="line" aria-label="Projects">
          <Table.Header bg="bg.subtle">
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Project</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>
                Updated
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} color="fg.muted" textAlign="center" py="6">
                  No projects match the current filter.
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((project) => (
                <Table.Row key={project.key}>
                  <Table.Cell fontFamily="mono" fontSize="xs" fontWeight="medium">
                    {project.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{project.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusColor[project.status]} variant="subtle">
                      {project.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                    {project.issues}
                  </Table.Cell>
                  <Table.Cell
                    color="fg.muted"
                    whiteSpace="nowrap"
                    display={{ base: "none", sm: "table-cell" }}
                  >
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
