"use client";

import { Badge, Box, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { reports } from "@/lib/data";

export default function Page() {
  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Reports
          </Title>
          <Text c="dimmed" mt={4}>
            Scheduled summaries your team receives from Lumen.
          </Text>
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {reports.map((report) => (
            <Card key={report.title}>
              <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                <Title order={2} size="h5">
                  {report.title}
                </Title>
                <Badge variant="light">{report.cadence}</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {report.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
