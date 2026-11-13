"use client"

import {
  Badge,
  Box,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import { InputGroup } from "@/components/ui/input-group"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const visible = projects.filter((p) => {
    const matchesStatus = status === "all" || p.status === status
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q)
    return matchesStatus && matchesQuery
  })

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issues."
      />

      <Stack direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <InputGroup
          flex="1"
          maxW={{ sm: "sm" }}
          startElement={<LuSearch aria-hidden="true" />}
        >
          <Input
            type="search"
            placeholder="Search by name or key"
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <NativeSelectRoot width={{ base: "full", sm: "48" }}>
          <NativeSelectField
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value)}
            items={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Paused", label: "Paused" },
              { value: "Archived", label: "Archived" },
            ]}
          />
        </NativeSelectRoot>
      </Stack>

      <Text fontSize="sm" color="fg.muted" mb="2" aria-live="polite">
        {visible.length} of {projects.length} projects
      </Text>

      <Box borderWidth="1px" rounded="l3" overflow="hidden">
        <Table.ScrollArea>
          <Table.Root size="md">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visible.map((p) => (
                <Table.Row key={p.key}>
                  <Table.Cell fontFamily="heading" fontWeight="semibold">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell>{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusPalette[p.status]}>{p.status}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                  <Table.Cell textAlign="end" whiteSpace="nowrap">
                    {formatDate(p.updated)}
                  </Table.Cell>
                </Table.Row>
              ))}
              {visible.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" color="fg.muted" py="8">
                    No projects match your filters.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </>
  )
}
