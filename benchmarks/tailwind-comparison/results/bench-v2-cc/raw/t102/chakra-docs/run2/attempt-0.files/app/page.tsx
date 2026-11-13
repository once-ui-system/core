"use client"

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import type { IconType } from "react-icons"
import { LuBug, LuCalendarCheck, LuFolderKanban, LuPause } from "react-icons/lu"
import { formatDate, projects, statusPalette, user } from "@/lib/data"

interface SummaryCard {
  label: string
  value: string
  hint: string
  icon: IconType
}

const active = projects.filter((p) => p.status === "Active")
const paused = projects.filter((p) => p.status === "Paused")
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
const latest = recent[0]

const cards: SummaryCard[] = [
  {
    label: "Active projects",
    value: String(active.length),
    hint: "Marketing site, Customer app, Public API",
    icon: LuFolderKanban,
  },
  {
    label: "Open issues",
    value: String(openIssues),
    hint: "Across every project",
    icon: LuBug,
  },
  {
    label: "Paused",
    value: String(paused.length),
    hint: paused.map((p) => p.name).join(", "),
    icon: LuPause,
  },
  {
    label: "Latest update",
    value: formatDate(latest.updated),
    hint: latest.name,
    icon: LuCalendarCheck,
  },
]

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0]

  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Welcome back, {firstName}
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Here is how things look across your workspace today.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6">
        {cards.map((card) => (
          <Card.Root key={card.label} size="lg">
            <Card.Body gap="4">
              <Flex align="center" justify="space-between" gap="3">
                <Text fontWeight="medium" color="fg.muted">
                  {card.label}
                </Text>
                <Flex
                  boxSize="11"
                  align="center"
                  justify="center"
                  borderRadius="l2"
                  bg="brand.subtle"
                  color="brand.fg"
                >
                  <Icon boxSize="5" aria-hidden>
                    <card.icon />
                  </Icon>
                </Flex>
              </Flex>
              <Text
                fontFamily="heading"
                fontSize="4xl"
                fontWeight="bold"
                lineHeight="1.1"
              >
                {card.value}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {card.hint}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root size="lg">
        <Card.Header>
          <Flex align="center" justify="space-between" gap="4" wrap="wrap">
            <Heading as="h2" size="xl">
              Recently updated
            </Heading>
            <Link asChild fontWeight="medium">
              <NextLink href="/projects">View all projects</NextLink>
            </Link>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="3" m="0" p="0" listStyleType="none">
            {recent.slice(0, 3).map((project) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                justify="space-between"
                gap="4"
                wrap="wrap"
                minH="14"
                px="4"
                py="3"
                borderRadius="l2"
                bg="bg.muted"
              >
                <Box>
                  <Text fontWeight="semibold">{project.name}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {project.key} · updated {formatDate(project.updated)}
                  </Text>
                </Box>
                <HStack gap="3">
                  <Text fontSize="sm" color="fg.muted">
                    {project.issues} open issues
                  </Text>
                  <Badge
                    size="lg"
                    colorPalette={statusPalette[project.status]}
                  >
                    {project.status}
                  </Badge>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
