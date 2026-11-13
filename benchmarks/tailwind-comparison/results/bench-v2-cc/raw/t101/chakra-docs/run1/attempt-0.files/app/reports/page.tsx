"use client"

import { Table } from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled reports sent to your team."
      />
      <Table.ScrollArea borderWidth="1px" rounded="l2">
        <Table.Root size="sm" minW="520px">
          <Table.Caption srOnly>Scheduled reports</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Schedule</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Recipients</Table.ColumnHeader>
              <Table.ColumnHeader>Last run</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((r) => (
              <Table.Row key={r.name}>
                <Table.Cell fontWeight="medium">{r.name}</Table.Cell>
                <Table.Cell>{r.schedule}</Table.Cell>
                <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                  {r.recipients}
                </Table.Cell>
                <Table.Cell>{formatDate(r.lastRun)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
