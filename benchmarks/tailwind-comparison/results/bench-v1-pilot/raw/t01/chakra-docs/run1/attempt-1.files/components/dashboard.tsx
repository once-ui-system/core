import NextLink from "next/link";
import { Box, Card, Heading, HStack, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects, recentActivity, user } from "@/lib/data";

export function Dashboard() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const firstName = user.name.split(" ")[0];

  const summary = [
    { label: "Open issues", value: String(openIssues), help: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), help: `${projects.length - active.length} paused or archived` },
    { label: "Busiest project", value: busiest.name, help: `${busiest.issues} open issues` },
    { label: "Latest update", value: formatDate(latest.updated), help: latest.name },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your workspace today."
      />

      <SimpleGrid
        as="ul"
        columns={{ base: 1, sm: 2, xl: 4 }}
        gap="4"
        mb="8"
        listStyleType="none"
        p="0"
      >
        {summary.map((item) => (
          <Card.Root key={item.label} as="li" size="sm">
            <Card.Body gap="1">
              <Text fontSize="sm" color="fg.muted">
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" letterSpacing="tight" lineClamp="1">
                {item.value}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {item.help}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <HStack justify="space-between">
              <Heading as="h2" size="md">
                Active projects
              </Heading>
              <Link asChild fontSize="sm">
                <NextLink href="/projects">View all</NextLink>
              </Link>
            </HStack>
          </Card.Header>
          <Card.Body>
            <Box
              as="ul"
              display="flex"
              flexDirection="column"
              gap="3"
              listStyleType="none"
              m="0"
              p="0"
            >
              {active.map((p) => (
                <HStack as="li" key={p.key} justify="space-between" gap="3">
                  <Box minW="0">
                    <Text fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {p.key} · Updated {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <HStack gap="3" flexShrink={0}>
                    <Text fontSize="sm" color="fg.muted">
                      {p.issues} issues
                    </Text>
                    <StatusBadge status={p.status} />
                  </HStack>
                </HStack>
              ))}
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Recent activity
            </Heading>
          </Card.Header>
          <Card.Body>
            <Box
              as="ul"
              display="flex"
              flexDirection="column"
              gap="4"
              listStyleType="none"
              m="0"
              p="0"
            >
              {recentActivity.map((a) => (
                <Box as="li" key={a.id}>
                  <Text fontSize="sm">{a.text}</Text>
                  <Text fontSize="xs" color="fg.muted">
                    {a.when}
                  </Text>
                </Box>
              ))}
            </Box>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
