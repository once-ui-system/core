import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import {
  formatDate,
  members,
  projects,
  recentProjects,
  user,
} from "@/lib/data"

export function Dashboard() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const activeProjects = projects.filter((p) => p.status === "Active").length
  const activeMembers = members.filter((m) => m.status === "Active").length
  const pendingInvites = members.filter((m) => m.status === "Invited").length

  const stats = [
    { label: "Open issues", value: openIssues, help: `across ${projects.length} projects` },
    { label: "Active projects", value: activeProjects, help: "currently in progress" },
    { label: "Active members", value: activeMembers, help: `of ${members.length} people` },
    { label: "Pending invites", value: pendingInvites, help: "awaiting a reply" },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across your Lumen workspace. Press Ctrl+K (⌘K on Mac) to jump anywhere."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mb="8">
        {stats.map((s) => (
          <Card.Root key={s.label} size="sm">
            <Card.Body>
              <Text fontSize="sm" color="fg.muted">
                {s.label}
              </Text>
              <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.2">
                {s.value}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {s.help}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated projects
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Box as="ul" listStyleType="none" m="0" p="0">
            {recentProjects.map((p, i) => (
              <Box
                as="li"
                key={p.key}
                py="3"
                borderTopWidth={i === 0 ? "0" : "1px"}
                borderColor="border"
              >
                <Flex justify="space-between" align="center" gap="3" wrap="wrap">
                  <Flex align="center" gap="3" minW="0">
                    <Badge variant="outline" fontFamily="mono">
                      {p.key}
                    </Badge>
                    <NextLink href="/projects">
                      <Text as="span" fontWeight="medium">
                        {p.name}
                      </Text>
                    </NextLink>
                  </Flex>
                  <Flex align="center" gap="3" wrap="wrap">
                    <Text as="span" fontSize="sm" color="fg.muted">
                      {p.issues} open {p.issues === 1 ? "issue" : "issues"}
                    </Text>
                    <StatusBadge status={p.status} />
                    <Text as="span" fontSize="sm" color="fg.muted">
                      {formatDate(p.updated)}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Box>
        </Card.Body>
      </Card.Root>
    </>
  )
}
