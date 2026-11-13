"use client"

import { PageHeader } from "@/components/page-header"
import { TextLink } from "@/components/text-link"
import { StatHelpText, StatLabel, StatRoot, StatValueText } from "@/components/ui/stat"
import { projects, user } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Badge, Box, Card, Flex, Grid, Heading, Progress, Text, chakra } from "@chakra-ui/react"

export function DashboardView() {
  const firstName = user.name.split(" ")[0]
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0)
  const activeCount = projects.filter((project) => project.status === "Active").length
  const withIssues = projects.filter((project) => project.issues > 0).length
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0]
  const maxIssues = Math.max(...projects.map((project) => project.issues), 1)

  const cards = [
    {
      label: "Open issues",
      value: String(openIssues),
      help: `across ${withIssues} projects`,
    },
    {
      label: "Active projects",
      value: String(activeCount),
      help: `of ${projects.length} in the workspace`,
    },
    {
      label: "Busiest project",
      value: busiest.key,
      help: `${busiest.name}, ${busiest.issues} open`,
    },
    {
      label: "Last update",
      value: formatDate(latest.updated),
      help: latest.name,
    },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Your workspace has ${activeCount} active projects and ${openIssues} open issues.`}
      />

      <Grid
        as="section"
        aria-label="Summary"
        templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
        gap="3"
        mb="4"
      >
        {cards.map((card) => (
          <Card.Root key={card.label}>
            <Card.Body>
              <StatRoot>
                <StatLabel>{card.label}</StatLabel>
                <StatValueText fontSize="2xl" fontFamily="heading">
                  {card.value}
                </StatValueText>
                <StatHelpText>{card.help}</StatHelpText>
              </StatRoot>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="3">
        <Card.Root as="section" aria-labelledby="issues-by-project">
          <Card.Header>
            <Flex justify="space-between" align="baseline" gap="2">
              <Heading as="h2" size="md" id="issues-by-project">
                Open issues by project
              </Heading>
              <TextLink href="/projects">View all projects</TextLink>
            </Flex>
          </Card.Header>
          <Card.Body>
            <chakra.ul listStyle="none" m="0" p="0" display="flex" flexDirection="column" gap="3">
              {projects.map((project) => (
                <li key={project.key}>
                  <Flex align="center" gap="3">
                    <Text
                      as="span"
                      w="10"
                      flexShrink={0}
                      fontFamily="mono"
                      fontSize="xs"
                      fontWeight="medium"
                      color="fg.muted"
                    >
                      {project.key}
                    </Text>
                    <Box flex="1" minW="0">
                      <Text fontWeight="medium" truncate>
                        {project.name}
                      </Text>
                      <Progress.Root
                        value={project.issues}
                        max={maxIssues}
                        size="xs"
                        colorPalette="brand"
                        aria-label={`${project.name}: ${project.issues} open issues`}
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                    <Text
                      as="span"
                      w="8"
                      flexShrink={0}
                      textAlign="end"
                      fontWeight="semibold"
                      fontVariantNumeric="tabular-nums"
                    >
                      {project.issues}
                    </Text>
                  </Flex>
                </li>
              ))}
            </chakra.ul>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="your-account">
          <Card.Header>
            <Heading as="h2" size="md" id="your-account">
              Your account
            </Heading>
          </Card.Header>
          <Card.Body>
            <Flex direction="column" gap="2">
              <Box>
                <Text fontSize="xs" color="fg.muted">
                  Name
                </Text>
                <Text fontWeight="medium">{user.name}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted">
                  Email
                </Text>
                <Text fontWeight="medium" wordBreak="break-all">
                  {user.email}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb="0.5">
                  Role
                </Text>
                <Badge colorPalette="brand" variant="subtle">
                  {user.role}
                </Badge>
              </Box>
              <TextLink href="/settings">Edit settings</TextLink>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Grid>
    </>
  )
}
