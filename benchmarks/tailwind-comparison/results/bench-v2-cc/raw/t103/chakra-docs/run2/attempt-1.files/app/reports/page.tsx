"use client"

import {
  Badge,
  Card,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import {
  type ProjectStatus,
  maxIssues,
  projects,
  statusPalette,
} from "@/lib/data"

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"]

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Where open issues sit across the workspace."
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
        <Card.Root variant="outline" gridColumn={{ lg: "span 2" }}>
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body pt="0">
            <Stack gap="4">
              {projects.map((p) => (
                <Stack key={p.key} gap="1">
                  <Flex justify="space-between" gap="3" fontSize="sm">
                    <Text>
                      <Text as="span" fontFamily="heading" fontWeight="semibold">
                        {p.key}
                      </Text>{" "}
                      <Text as="span" color="fg.muted">
                        {p.name}
                      </Text>
                    </Text>
                    <Text fontWeight="medium">{p.issues}</Text>
                  </Flex>
                  <Progress.Root
                    value={p.issues}
                    max={maxIssues}
                    size="sm"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md">
              Projects by status
            </Heading>
          </Card.Header>
          <Card.Body pt="0">
            <Stack gap="3">
              {statuses.map((s) => (
                <Flex key={s} justify="space-between" align="center">
                  <Badge colorPalette={statusPalette[s]}>{s}</Badge>
                  <Text fontFamily="heading" fontWeight="semibold">
                    {projects.filter((p) => p.status === s).length}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  )
}
