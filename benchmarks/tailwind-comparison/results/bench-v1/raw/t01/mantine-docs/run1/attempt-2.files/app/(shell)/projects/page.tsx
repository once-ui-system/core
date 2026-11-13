import type { Metadata } from "next";
import { Stack, Text, Title } from "@mantine/core";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Projects
        </Title>
        <Text c="dimmed" mt={4}>
          {projects.length} projects in the Acme Labs workspace. Dates are shown
          in UTC.
        </Text>
      </div>
      <ProjectsTable />
    </Stack>
  );
}
