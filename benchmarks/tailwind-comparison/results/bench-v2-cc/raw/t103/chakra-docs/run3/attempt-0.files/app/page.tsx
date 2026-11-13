"use client";

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  Link,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  activeCount,
  busiestProject,
  formatDate,
  maxIssues,
  projects,
  recentProjects,
  statusPalette,
  totalIssues,
  user,
} from "@/lib/data";

function SummaryCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <Card.Root variant="outline" bg="bg.panel">
      <Card.Body>
        <Stat.Root>
          <Stat.Label>{label}</Stat.Label>
          <Stat.ValueText fontFamily="heading">{value}</Stat.ValueText>
          <Stat.HelpText>{help}</Stat.HelpText>
        </Stat.Root>
      </Card.Body>
    </Card.Root>
  );
}

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const latest = recentProjects[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`You are signed in as ${user.role.toLowerCase()} of the workspace. Here is where your ${projects.length} projects stand today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb={{ base: "6", md: "8" }}>
        <SummaryCard
          label="Open issues"
          value={String(totalIssues)}
          help={`across ${projects.length} projects`}
        />
        <SummaryCard
          label="Active projects"
          value={`${activeCount} of ${projects.length}`}
          help="1 paused, 1 archived"
        />
        <SummaryCard
          label="Busiest project"
          value={busiestProject.key}
          help={`${busiestProject.name}, ${busiestProject.issues} open issues`}
        />
        <SummaryCard
          label="Latest update"
          value={formatDate(latest.updated)}
          help={latest.name}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4" as="ul" listStyleType="none" m="0" p="0">
              {projects.map((p) => (
                <Box as="li" key={p.key}>
                  <Flex justify="space-between" mb="1" fontSize="sm" gap="3">
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

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Recently updated
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4" as="ul" listStyleType="none" m="0" p="0">
              {recentProjects.slice(0, 4).map((p) => (
                <Flex as="li" key={p.key} justify="space-between" align="center" gap="3">
                  <Box minW="0">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <Badge colorPalette={statusPalette[p.status]} variant="subtle">
                    {p.status}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
          <Card.Footer>
            <HStack>
              <Link asChild>
                <NextLink href="/projects">View all projects</NextLink>
              </Link>
            </HStack>
          </Card.Footer>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
