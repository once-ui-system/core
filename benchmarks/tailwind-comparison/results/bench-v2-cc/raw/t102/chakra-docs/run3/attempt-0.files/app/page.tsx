"use client"

import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { Link } from "@chakra-ui/react"
import { formatDate, projects, statusPalette, user } from "@/lib/data"

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const active = projects.filter((p) => p.status === "Active")
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0]
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1)
  const firstName = user.name.split(" ")[0]

  const cards = [
    { label: "Open issues", value: String(totalIssues), help: "Across all projects" },
    { label: "Active projects", value: String(active.length), help: `of ${projects.length} in the workspace` },
    { label: "Most issues", value: "Customer app", help: "31 open right now" },
    { label: "Last activity", value: formatDate(latest.updated), help: latest.name },
  ]

  return (
    <Stack gap="10">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Welcome back, {firstName}!
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Here is how things look for the team at Acme Labs today. Nice work, keep the momentum going.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6" aria-label="Summary">
        {cards.map((c) => (
          <Card.Root key={c.label} size="lg">
            <Card.Body>
              <Stat.Root>
                <Stat.Label fontSize="md">{c.label}</Stat.Label>
                <Stat.ValueText fontSize="3xl" fontFamily="heading">
                  {c.value}
                </Stat.ValueText>
                <Stat.HelpText>{c.help}</Stat.HelpText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root as="section" id="reports" aria-labelledby="reports-title" size="lg" scrollMarginTop="28">
        <Card.Header>
          <Heading as="h2" id="reports-title" size="xl">
            Reports: issues by project
          </Heading>
          <Text color="fg.muted">Where the team's attention is going this month.</Text>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="6" listStyle="none" m="0" p="0">
            {projects.map((p) => (
              <Box as="li" key={p.key}>
                <HStack justify="space-between" mb="2" gap="4">
                  <HStack gap="3" minW="0">
                    <Link asChild fontWeight="semibold">
                      <NextLink href="/projects">{p.name}</NextLink>
                    </Link>
                    <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="md">
                      {p.status}
                    </Badge>
                  </HStack>
                  <Text fontWeight="semibold">
                    {p.issues} {p.issues === 1 ? "issue" : "issues"}
                  </Text>
                </HStack>
                <Progress.Root
                  value={p.issues}
                  max={maxIssues}
                  size="md"
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
    </Stack>
  )
}
