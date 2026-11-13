"use client"

import { PageHeader } from "@/components/page-header"
import { reports } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Table } from "@chakra-ui/react"

export function ReportsView() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Saved analytics reports and when each one last ran."
      />
      <Table.ScrollArea borderWidth="1px" borderRadius="l2">
        <Table.Root size="sm" variant="line" aria-label="Reports">
          <Table.Header bg="bg.subtle">
            <Table.Row>
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Schedule</Table.ColumnHeader>
              <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>
                Owner
              </Table.ColumnHeader>
              <Table.ColumnHeader>Last run</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell fontWeight="medium">{report.name}</Table.Cell>
                <Table.Cell color="fg.muted" whiteSpace="nowrap">
                  {report.cadence}
                </Table.Cell>
                <Table.Cell
                  color="fg.muted"
                  whiteSpace="nowrap"
                  display={{ base: "none", sm: "table-cell" }}
                >
                  {report.owner}
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">
                  <time dateTime={report.lastRun}>{formatDate(report.lastRun)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
