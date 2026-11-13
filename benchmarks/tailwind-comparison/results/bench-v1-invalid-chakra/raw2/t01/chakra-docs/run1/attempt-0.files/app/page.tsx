import { Badge, Box, Card, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, product, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const summary = [
    { label: "Open issues", value: String(openIssues), hint: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), hint: active.map((p) => p.key).join(", ") },
    { label: "Busiest project", value: busiest.name, hint: `${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), hint: latest.name },
  ];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${product.tagline}. Here is where your workspace stands today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summary.map((s) => (
          <Card.Root key={s.label} variant="outline">
            <Card.Body gap="1">
              <Text fontSize="sm" color="fg.muted">
                {s.label}
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" lineHeight="short">
                {s.value}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {s.hint}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Card.Title>Recently updated</Card.Title>
          <Card.Description>The latest movement across your projects.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
            {[...projects]
              .sort((a, b) => b.updated.localeCompare(a.updated))
              .slice(0, 3)
              .map((p) => (
                <HStack as="li" key={p.key} justify="space-between" gap="3" wrap="wrap">
                  <Box minW="0">
                    <Text fontWeight="medium">{p.name}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {p.key} · {p.issues} open issues · Updated {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </HStack>
              ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </AppShell>
  );
}
