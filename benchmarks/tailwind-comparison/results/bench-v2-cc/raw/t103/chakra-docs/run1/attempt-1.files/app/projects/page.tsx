"use client"

import {
  Box,
  Input,
  Stack,
  Table,
  Text,
  chakra,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { InputGroup } from "@/components/ui/input-group"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { formatDate, projects } from "@/lib/data"

const statusItems = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
]

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q)),
    )
  }, [query, status])

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace and where its issues stand."
      />

      <Stack direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <InputGroup flex="1" startElement={<LuSearch aria-hidden="true" />}>
          <Input
            type="search"
            placeholder="Search by name or key"
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </InputGroup>
        <NativeSelectRoot width={{ base: "full", sm: "12rem" }}>
          <NativeSelectField
            aria-label="Filter by status"
            items={statusItems}
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value)}
          />
        </NativeSelectRoot>
      </Stack>

      <Text fontSize="sm" color="fg.muted" mb="2" role="status" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </Text>

      <Box overflowX="auto" borderWidth="1px" borderRadius="l3">
        <Table.Root aria-label="Projects" size="md">
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
            {visible.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell>
                  <chakra.span fontFamily="mono" fontWeight="medium">
                    {p.key}
                  </chakra.span>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{p.name}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={p.status} />
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
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
      </Box>
    </>
  )
}
