"use client";

import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { projects, user } from "@/lib/data";

export function Dashboard() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const firstName = user.name.split(" ")[0];

  const cards = [
    {
      label: "Open issues",
      value: String(openIssues),
      note: `Across ${projects.length} projects`,
    },
    {
      label: "Active projects",
      value: String(active.length),
      note: active.map((p) => p.key).join(", "),
    },
    {
      label: "Busiest project",
      value: busiest.name,
      note: `${busiest.issues} open issues`,
    },
    {
      label: "Weekly active users",
      value: "1,284",
      note: "+6.2% from last week",
    },
  ];

  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  return (
    <Stack gap="8">
      <Box>
        <Heading as="h1" size="2xl">
          Welcome back, {firstName}
        </Heading>
        <Text color="fg.muted" mt="1">
          Here is what is happening across your workspace today.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
        {cards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body gap="1">
              <Text textStyle="sm" color="fg.muted">
                {card.label}
              </Text>
              <Text textStyle="2xl" fontWeight="semibold" truncate>
                {card.value}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {card.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Box id="reports">
        <Card.Root variant="outline">
          <Card.Header>
            <Card.Title>Recently updated</Card.Title>
            <Card.Description>
              The three projects with the latest activity.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
              {recent.map((p) => (
                <HStack as="li" key={p.key} justify="space-between" gap="3">
                  <HStack gap="3" minW="0">
                    <Badge variant="surface">{p.key}</Badge>
                    <Text truncate>{p.name}</Text>
                  </HStack>
                  <Text textStyle="sm" color="fg.muted" flexShrink="0">
                    {p.issues} open
                  </Text>
                </HStack>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      </Box>
    </Stack>
  );
}
