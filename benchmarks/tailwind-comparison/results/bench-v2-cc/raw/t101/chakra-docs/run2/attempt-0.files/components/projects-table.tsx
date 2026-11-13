"use client"

import { Badge, Table } from "@chakra-ui/react"
import { formatDate, type Project, type ProjectStatus } from "@/lib/data"

const statusPalette: Record<ProjectStatus, string> = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
}

export function ProjectsTable({
  items,
  label,
}: {
  items: Project[]
  label: string
}) {
  return (
    <Table.ScrollArea
      borderWidth="1px"
      rounded="l2"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <Table.Root size="sm" interactive>
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader>Key</Table.ColumnHeader>
            <Table.ColumnHeader>Project</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((p) => (
            <Table.Row key={p.key}>
              <Table.Cell fontFamily="mono" fontWeight="medium">
                {p.key}
              </Table.Cell>
              <Table.Cell>{p.name}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="sm">
                  {p.status}
                </Badge>
              </Table.Cell>
              <Table.Cell textAlign="end" css={{ fontVariantNumeric: "tabular-nums" }}>
                {p.issues}
              </Table.Cell>
              <Table.Cell textAlign="end" whiteSpace="nowrap">
                <time dateTime={p.updated}>{formatDate(p.updated)}</time>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
