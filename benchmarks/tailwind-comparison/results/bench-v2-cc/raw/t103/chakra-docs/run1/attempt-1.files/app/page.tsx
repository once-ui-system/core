"use client"

import {
  Box,
  Card,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import {
  StatHelpText,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@/components/ui/stat"
import {
  activeProjects,
  busiestProject,
  firstName,
  formatDate,
  projects,
  projectsByUpdate,
  totalIssues,
  user,
} from "@/lib/data"

export default function DashboardPage() {
  const latest = projectsByUpdate[0]
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(user.name)}`}
        description={`${activeProjects.length} projects are active and ${totalIssues} issues are open across the workspace.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="6">
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Open issues</StatLabel>
              <StatValueText>{totalIssues}</StatValueText>
              <StatHelpText>across {projects.length} projects</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Active projects</StatLabel>
              <StatValueText>{activeProjects.length}</StatValueText>
              <StatHelpText>of {projects.length} in the workspace</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Busiest project</StatLabel>
              <StatValueText>{busiestProject.key}</StatValueText>
              <StatHelpText>
                {busiestProject.name}, {busiestProject.issues} open issues
              </StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Last activity</StatLabel>
              <StatValueText>{formatDate(latest.updated)}</StatValueText>
              <StatHelpText>{latest.name}</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {projects.map((p) => (
                <Box key={p.key}>
                  <Flex justify="space-between" mb="1" fontSize="sm">
                    <Text>
                      <chakra.span fontFamily="mono" color="fg.muted" mr="2">
                        {p.key}
                      </chakra.span>
                      {p.name}
                    </Text>
                    <Text fontWeight="medium">{p.issues}</Text>
                  </Flex>
                  <ProgressRoot
                    value={p.issues}
                    max={maxIssues}
                    size="sm"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <ProgressBar />
                  </ProgressRoot>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Recently updated
            </Heading>
          </Card.Header>
          <Card.Body>
            <chakra.ul listStyle="none" m="0" p="0">
              {projectsByUpdate.map((p) => (
                <chakra.li
                  key={p.key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="3"
                  py="3"
                  borderTopWidth="1px"
                  _first={{ borderTopWidth: "0", pt: "0" }}
                  _last={{ pb: "0" }}
                >
                  <Box minW="0">
                    <Text fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      <chakra.span fontFamily="mono">{p.key}</chakra.span>
                      {" · "}
                      <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                    </Text>
                  </Box>
                  <StatusBadge status={p.status} />
                </chakra.li>
              ))}
            </chakra.ul>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  )
}
