"use client"

import { useState } from "react"
import { Badge, Box, Input, Table, Text } from "@chakra-ui/react"
import { LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { PageHeader } from "@/components/page-header"
import { formatDate, projects } from "@/lib/data"

const statusColor = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
} as const

export default function ProjectsPage() {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const rows = projects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
  )

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in this workspace`}
      />

      <Box mb="3" maxW={{ base: "full", sm: "xs" }}>
        <InputGroup w="full" startElement={<LuSearch />}>
          <Input
            aria-label="Filter projects"
            placeholder="Filter by name or key"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </Box>

      <Table.ScrollArea borderWidth="1px" rounded="l2">
        <Table.Root size="sm" minW="520px">
          <Table.Caption srOnly>Lumen projects</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Project</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text color="fg.muted" py="2">
                    No projects match &ldquo;{query}&rdquo;.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((p) => (
                <Table.Row key={p.key}>
                  <Table.Cell fontFamily="mono" textStyle="xs">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge size="sm" variant="subtle" colorPalette={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                    {p.issues}
                  </Table.Cell>
                  <Table.Cell>{formatDate(p.updated)}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
