"use client";

import { Column } from "@once-ui-system/core";
import { PageHeader } from "./PageHeader";
import { ProjectsTable } from "./ProjectsTable";

export function ProjectsView() {
  return (
    <Column gap="32">
      <PageHeader title="Projects" description="Every project in the Acme Labs workspace and where it stands." />
      <ProjectsTable />
    </Column>
  );
}
