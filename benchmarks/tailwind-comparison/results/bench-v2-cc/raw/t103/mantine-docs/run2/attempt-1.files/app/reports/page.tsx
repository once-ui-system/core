"use client";

import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Stack gap="lg">
      <PageHeader title="Reports" description="Saved views of how your team is shipping." />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {reports.map((report) => (
          <Card key={report.title}>
            <Title order={2} size="h4" mb={4}>
              {report.title}
            </Title>
            <Text c="dimmed" size="sm">
              {report.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
