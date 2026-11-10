"use client"

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { LuActivity, LuBug, LuClock, LuFolder } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import {
  activeProjects,
  busiestProject,
  formatDate,
  projects,
  recentlyUpdated,
  totalIssues,
  user,
} from "@/lib/data"

const summary = [
  {
    label: "Active projects",
    value: String(activeProjects.length),
    help: `of ${projects.length} projects`,
    icon: LuFolder,
  },
  {
    label: "Open issues",
    value: String(totalIssues),
    help: "across all projects",
    icon: LuBug,
  },
  {
    label: "Busiest project",
    value: busiestProject.key,
    help: `${busiestProject.name}, ${busiestProject.issues} issues`,
    icon: LuActivity,
  },
  {
    label: "Last update",
    value: formatDate(recentlyUpdated[0].updated),
    help: recentlyUpdated[0].name,
    icon: LuClock,
  },
]

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0]
  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summary.map((item) => {
          const Icon = item.icon
          return (
            <Card.Root key={item.label} variant="outline">
              <Card.Body>
                <Flex justify="space-between" align="flex-start" gap="3">
                  <Stat.Root>
                    <Stat.Label>{item.label}</Stat.Label>
                    <Stat.ValueText fontFamily="heading" fontSize="2xl">
                      {item.value}
                    </Stat.ValueText>
                    <Stat.HelpText>{item.help}</Stat.HelpText>
                  </Stat.Root>
                  <Box color="brand.fg" aria-hidden="true">
                    <Icon size={20} />
                  </Box>
                </Flex>
              </Card.Body>
            </Card.Root>
          )
        })}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Stack as="ul" m="0" p="0" listStyleType="none" gap="0">
            {recentlyUpdated.slice(0, 4).map((project) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                gap="3"
                py="3"
                borderTopWidth="1px"
                wrap="wrap"
              >
                <Badge variant="outline" fontFamily="heading">
                  {project.key}
                </Badge>
                <Link asChild fontWeight="medium" flex="1" minW="40">
                  <NextLink href="/projects">{project.name}</NextLink>
                </Link>
                <Text fontSize="sm" color="fg.muted">
                  {project.issues} open · {formatDate(project.updated)}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
