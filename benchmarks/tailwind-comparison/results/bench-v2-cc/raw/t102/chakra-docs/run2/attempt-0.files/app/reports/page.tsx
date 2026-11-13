"use client"

import { Card, Flex, Heading, Progress, Stack, Text } from "@chakra-ui/react"
import { projects } from "@/lib/data"

const maxIssues = Math.max(...projects.map((p) => p.issues))

export default function ReportsPage() {
  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Reports
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Where your team&apos;s open issues sit right now.
        </Text>
      </Stack>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Open issues by project
          </Heading>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="6" m="0" p="0" listStyleType="none">
            {projects.map((project) => (
              <Stack as="li" key={project.key} gap="2">
                <Flex justify="space-between" gap="4">
                  <Text fontWeight="medium">{project.name}</Text>
                  <Text color="fg.muted">{project.issues}</Text>
                </Flex>
                <Progress.Root
                  value={project.issues}
                  max={maxIssues}
                  size="lg"
                  aria-label={`${project.name}: ${project.issues} open issues`}
                >
                  <Progress.Track borderRadius="full">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Stack>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
