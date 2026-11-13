"use client";

import { Card, Table } from "@mantine/core";
import { formatDate, reports } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function ReportsList() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled summaries that Lumen sends to your team."
      />
      <Card>
        <Table.ScrollContainer minWidth={520}>
          <Table>
            <Table.Caption>{reports.length} scheduled reports</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Report</Table.Th>
                <Table.Th scope="col">Schedule</Table.Th>
                <Table.Th scope="col">Recipients</Table.Th>
                <Table.Th scope="col">Last run</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((report) => (
                <Table.Tr key={report.name}>
                  <Table.Td fw={600}>{report.name}</Table.Td>
                  <Table.Td>{report.cadence}</Table.Td>
                  <Table.Td>{report.recipients}</Table.Td>
                  <Table.Td>{formatDate(report.lastRun)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
