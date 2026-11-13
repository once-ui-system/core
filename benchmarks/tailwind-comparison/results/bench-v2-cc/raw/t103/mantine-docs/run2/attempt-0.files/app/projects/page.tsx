"use client";

import { Stack } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";

export default function ProjectsPage() {
  return (
    <Stack gap="lg">
      <PageHeader title="Projects" description="Every project in your workspace and where it stands." />
      <ProjectsTable />
    </Stack>
  );
}
