"use client";

import { Box, Card, Flex, Heading, Progress, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { PageHeader } from "@/components/page-header";
import { issuesByStatus, maxIssues, projects, totalIssues, type ProjectStatus } from "@/lib/data";

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"];

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Where open issues sit by project status and by project."
      />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by status
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {statuses.map((s) => {
                const count = issuesByStatus(s);
                return (
                  <Box key={s}>
                    <Flex justify="space-between" fontSize="sm" mb="1">
                      <Text>{s}</Text>
                      <Text fontFamily="mono">
                        {count} of {totalIssues}
                      </Text>
                    </Flex>
                    <Progress.Root
                      value={count}
                      max={totalIssues}
                      size="xs"
                      aria-label={`${s} projects: ${count} open issues`}
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                );
              })}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {projects.map((p) => (
                <Box key={p.key}>
                  <Flex justify="space-between" fontSize="sm" mb="1">
                    <Text>
                      <Text as="span" fontFamily="mono" color="fg.muted" mr="2">
                        {p.key}
                      </Text>
                      {p.name}
                    </Text>
                    <Text fontFamily="mono">{p.issues}</Text>
                  </Flex>
                  <Progress.Root
                    value={p.issues}
                    max={maxIssues}
                    size="xs"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
