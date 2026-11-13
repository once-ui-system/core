import NextLink from "next/link";
import { Badge, Box, Card, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { formatDate, members, projects, recentProjects, statusColor, user } from "@/lib/data";

export function DashboardView() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: `across ${projects.length} projects` },
    { label: "Active projects", value: activeProjects, note: "currently shipping" },
    { label: "Active members", value: activeMembers, note: `of ${members.length} seats` },
    { label: "Pending invites", value: pendingInvites, note: "awaiting a response" },
  ];

  return (
    <Stack gap="6">
      <Box>
        <Heading as="h1" size="2xl">
          Good morning, {user.name.split(" ")[0]}
        </Heading>
        <Text color="fg.muted" mt="1">
          Here is what is happening across your workspace. Press{" "}
          <Box as="kbd" fontFamily="mono" fontSize="sm" borderWidth="1px" rounded="sm" px="1.5">
            Ctrl K
          </Box>{" "}
          or <Box as="kbd" fontFamily="mono" fontSize="sm" borderWidth="1px" rounded="sm" px="1.5">⌘K</Box>{" "}
          to jump anywhere.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" role="list" aria-label="Workspace summary">
        {stats.map((stat) => (
          <Card.Root key={stat.label} role="listitem">
            <Card.Body gap="1">
              <Text color="fg.muted" textStyle="sm">
                {stat.label}
              </Text>
              <Text textStyle="3xl" fontWeight="semibold">
                {stat.value}
              </Text>
              <Text color="fg.muted" textStyle="xs">
                {stat.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Flex justify="space-between" align="center" gap="3">
            <Card.Title as="h2">Recently updated</Card.Title>
            <NextLink href="/projects">
              <Text textStyle="sm" color="blue.fg" _hover={{ textDecoration: "underline" }}>
                View all projects
              </Text>
            </NextLink>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Stack gap="0" as="ul" listStyleType="none">
            {recentProjects.map((project) => (
              <Flex
                as="li"
                key={project.key}
                justify="space-between"
                align="center"
                gap="3"
                py="3"
                borderTopWidth="1px"
                _first={{ borderTopWidth: "0", pt: "0" }}
              >
                <Box minW="0">
                  <Text fontWeight="medium" truncate>
                    {project.name}
                  </Text>
                  <Text color="fg.muted" textStyle="xs">
                    {project.key} · {project.issues} open issues · updated {formatDate(project.updated)}
                  </Text>
                </Box>
                <Badge colorPalette={statusColor[project.status]}>{project.status}</Badge>
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
