"use client"

import { Badge, Card, Heading, SimpleGrid, Text } from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled reports that keep the team informed without a status meeting."
      />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {reports.map((r) => (
          <Card.Root key={r.id}>
            <Card.Header>
              <Heading as="h2" size="md">
                {r.name}
              </Heading>
            </Card.Header>
            <Card.Body gap="3">
              <Text color="fg.muted">{r.description}</Text>
              <Text fontSize="sm" color="fg.muted">
                Last run <time dateTime={r.lastRun}>{formatDate(r.lastRun)}</time>
              </Text>
            </Card.Body>
            <Card.Footer>
              <Badge>{r.cadence}</Badge>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
    </>
  )
}
