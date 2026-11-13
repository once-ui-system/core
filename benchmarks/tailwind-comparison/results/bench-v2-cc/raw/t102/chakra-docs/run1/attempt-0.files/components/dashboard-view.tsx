"use client"

import {
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
import { LuBug, LuCirclePause, LuFolderCheck, LuHistory } from "react-icons/lu"
import { PageIntro } from "@/components/page-intro"
import { ProgressBar, ProgressRoot, ProgressValueText } from "@/components/ui/progress"
import {
  countByStatus,
  formatDate,
  projects,
  statusColor,
  totalIssues,
  user,
} from "@/lib/data"

function SummaryCard({
  icon,
  label,
  value,
  hint,
  palette,
}: {
  icon: IconType
  label: string
  value: string
  hint: string
  palette: string
}) {
  const Glyph = icon
  return (
    <Card.Root variant="elevated" colorPalette={palette}>
      <Card.Body gap="4">
        <Flex align="center" justify="space-between" gap="3">
          <Text color="fg.muted" fontWeight="medium">
            {label}
          </Text>
          <Flex
            boxSize="12"
            align="center"
            justify="center"
            borderRadius="l2"
            bg="colorPalette.muted"
            color="colorPalette.fg"
            aria-hidden="true"
          >
            <Icon boxSize="6">
              <Glyph />
            </Icon>
          </Flex>
        </Flex>
        <Text fontFamily="heading" fontWeight="bold" fontSize="4xl" lineHeight="1">
          {value}
        </Text>
        <Text textStyle="sm" color="fg.muted">
          {hint}
        </Text>
      </Card.Body>
    </Card.Root>
  )
}

export function DashboardView() {
  const firstName = user.name.split(" ")[0]
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 4)
  const withIssues = [...projects]
    .filter((p) => p.issues > 0)
    .sort((a, b) => b.issues - a.issues)
  const latest = recent[0]

  return (
    <Stack gap="10">
      <PageIntro
        title={`Welcome back, ${firstName}`}
        description="Here is how your projects are doing today. Nice work, team."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6">
        <SummaryCard
          icon={LuBug}
          label="Open issues"
          value={String(totalIssues)}
          hint={`Across ${projects.length} projects`}
          palette="brand"
        />
        <SummaryCard
          icon={LuFolderCheck}
          label="Active projects"
          value={String(countByStatus("Active"))}
          hint={`${countByStatus("Archived")} archived`}
          palette="green"
        />
        <SummaryCard
          icon={LuCirclePause}
          label="Paused projects"
          value={String(countByStatus("Paused"))}
          hint="Mobile beta is waiting for a restart"
          palette="orange"
        />
        <SummaryCard
          icon={LuHistory}
          label="Latest update"
          value={formatDate(latest.updated)}
          hint={latest.name}
          palette="gray"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 5 }} gap="6">
        <Box id="reports" gridColumn={{ lg: "span 3" }} scrollMarginTop="24">
          <Card.Root variant="outline" h="full">
            <Card.Body gap="6">
              <Box>
                <Heading as="h2" size="xl">
                  Open issues by project
                </Heading>
                <Text color="fg.muted" mt="1">
                  Each bar shows a project's share of the {totalIssues} open issues.
                </Text>
              </Box>
              <Stack asChild gap="5">
                <ul>
                  {withIssues.map((p) => {
                    const share = Math.round((p.issues / totalIssues) * 100)
                    return (
                      <li key={p.key}>
                        <ProgressRoot value={share} size="lg" colorPalette="brand">
                          <HStack justify="space-between" mb="2">
                            <Text fontWeight="medium">
                              {p.name}{" "}
                              <Text as="span" color="fg.muted" fontWeight="normal">
                                ({p.issues} {p.issues === 1 ? "issue" : "issues"})
                              </Text>
                            </Text>
                            <ProgressValueText />
                          </HStack>
                          <ProgressBar />
                        </ProgressRoot>
                      </li>
                    )
                  })}
                </ul>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>

        <Box gridColumn={{ lg: "span 2" }}>
          <Card.Root variant="outline" h="full">
            <Card.Body gap="5">
              <Heading as="h2" size="xl">
                Recently updated
              </Heading>
              <Stack asChild gap="2">
                <ul>
                  {recent.map((p) => (
                    <li key={p.key}>
                      <Link
                        asChild
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap="3"
                        minH="14"
                        px="4"
                        borderRadius="l2"
                        textDecoration="none"
                        color="fg"
                        _hover={{ bg: "bg.muted", textDecoration: "none" }}
                      >
                        <NextLink href="/projects">
                          <Box minW="0">
                            <Text fontWeight="semibold" truncate>
                              {p.name}
                            </Text>
                            <Text textStyle="sm" color="fg.muted">
                              {formatDate(p.updated)}
                            </Text>
                          </Box>
                          <Text
                            textStyle="sm"
                            fontWeight="medium"
                            color={`${statusColor[p.status]}.fg`}
                          >
                            {p.status}
                          </Text>
                        </NextLink>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>
    </Stack>
  )
}
