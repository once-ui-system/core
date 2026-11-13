"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuFolderSearch, LuPlus, LuSearch } from "react-icons/lu"
import { PageIntro } from "@/components/page-intro"
import { EmptyState } from "@/components/ui/empty-state"
import { InputGroup } from "@/components/ui/input-group"
import { toaster } from "@/components/ui/toaster"
import {
  formatDate,
  projects,
  statusColor,
  type ProjectStatus,
} from "@/lib/data"

const filters: Array<"All" | ProjectStatus> = ["All", "Active", "Paused", "Archived"]

export function ProjectsView() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<"All" | ProjectStatus>("All")

  const visible = projects.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    return matchesQuery && (status === "All" || p.status === status)
  })

  return (
    <Stack gap="8">
      <PageIntro
        title="Projects"
        description="Everything your team is building, in one friendly list."
        actions={
          <Button
            colorPalette="brand"
            onClick={() =>
              toaster.create({
                title: "New projects are coming soon",
                description: "For now, this workspace keeps the five projects below.",
                type: "info",
              })
            }
          >
            <LuPlus />
            New project
          </Button>
        }
      />

      <Flex direction={{ base: "column", md: "row" }} gap="4" align={{ md: "center" }}>
        <InputGroup
          flex="1"
          maxW={{ md: "md" }}
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
        <Flex role="group" aria-label="Filter by status" gap="2" wrap="wrap">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              borderRadius="full"
              variant={status === f ? "solid" : "outline"}
              colorPalette={status === f ? "brand" : "gray"}
              aria-pressed={status === f}
              onClick={() => setStatus(f)}
            >
              {f}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Text color="fg.muted" textStyle="sm" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </Text>

      {visible.length === 0 ? (
        <EmptyState
          icon={<LuFolderSearch />}
          title="No projects match"
          description="Try a different search or clear the status filter."
        >
          <Button
            variant="outline"
            colorPalette="gray"
            onClick={() => {
              setQuery("")
              setStatus("All")
            }}
          >
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="l3"
          overflow="hidden"
        >
          <Table.ScrollArea>
            <Table.Root size="lg" interactive aria-label="Projects" minW="2xl">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader px="6" py="4">Key</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Project</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Status</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Open issues</Table.ColumnHeader>
                  <Table.ColumnHeader px="6" py="4" textAlign="end">Updated</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {visible.map((p) => (
                  <Table.Row key={p.key}>
                    <Table.Cell px="6" py="5" fontFamily="mono" fontWeight="semibold" color="colorPalette.fg">
                      {p.key}
                    </Table.Cell>
                    <Table.Cell py="5" fontWeight="semibold">{p.name}</Table.Cell>
                    <Table.Cell py="5">
                      <Badge
                        size="lg"
                        borderRadius="full"
                        px="3"
                        colorPalette={statusColor[p.status]}
                      >
                        {p.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell py="5" textAlign="end">{p.issues}</Table.Cell>
                    <Table.Cell px="6" py="5" textAlign="end" color="fg.muted">
                      {formatDate(p.updated)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      )}
    </Stack>
  )
}
