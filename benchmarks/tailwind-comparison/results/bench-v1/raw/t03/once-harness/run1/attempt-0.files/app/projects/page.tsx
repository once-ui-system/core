import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <PageHeader title="Projects" description="Every project in the Acme Labs workspace and where it stands." />
      <ProjectsTable />
    </Column>
  );
}
