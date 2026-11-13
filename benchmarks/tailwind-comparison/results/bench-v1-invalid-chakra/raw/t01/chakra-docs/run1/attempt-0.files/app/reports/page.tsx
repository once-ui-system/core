import type { Metadata } from "next";
import { Box, Card, Heading, Stack, Table, Text } from "@chakra-ui/react";

export const metadata: Metadata = { title: "Reports · Lumen" };

const reports = [
  { name: "Weekly active users", cadence: "Weekly", lastRun: "Oct 12, 2026" },
  { name: "Issue throughput", cadence: "Weekly", lastRun: "Oct 12, 2026" },
  { name: "Release health", cadence: "Monthly", lastRun: "Oct 1, 2026" },
];

export default function ReportsPage() {
  return (
    <Stack gap="6">
      <Box>
        <Heading as="h1" size="2xl">
          Reports
        </Heading>
        <Text color="fg.muted" mt="1">
          Scheduled reports for your workspace.
        </Text>
      </Box>
      <Card.Root variant="outline">
        <Card.Body>
          <Table.ScrollArea>
            <Table.Root size="md">
              <Table.Caption srOnly>Scheduled reports</Table.Caption>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader scope="col">Report</Table.ColumnHeader>
                  <Table.ColumnHeader scope="col">Cadence</Table.ColumnHeader>
                  <Table.ColumnHeader scope="col" textAlign="end">
                    Last run
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reports.map((r) => (
                  <Table.Row key={r.name}>
                    <Table.Cell fontWeight="medium">{r.name}</Table.Cell>
                    <Table.Cell>{r.cadence}</Table.Cell>
                    <Table.Cell textAlign="end">{r.lastRun}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
