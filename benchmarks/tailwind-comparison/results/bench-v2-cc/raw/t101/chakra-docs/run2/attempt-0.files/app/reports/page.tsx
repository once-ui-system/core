"use client"

import { Box, Heading, Table, Text } from "@chakra-ui/react"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Reports
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        Scheduled reports generated for your workspace.
      </Text>
      <Table.ScrollArea borderWidth="1px" rounded="l2" role="region" aria-label="Reports" tabIndex={0}>
        <Table.Root size="sm" interactive>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Period</Table.ColumnHeader>
              <Table.ColumnHeader>Owner</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Generated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((r) => (
              <Table.Row key={r.name}>
                <Table.Cell fontWeight="medium">{r.name}</Table.Cell>
                <Table.Cell>{r.period}</Table.Cell>
                <Table.Cell>{r.owner}</Table.Cell>
                <Table.Cell textAlign="end" whiteSpace="nowrap">
                  <time dateTime={r.generated}>{formatDate(r.generated)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}
