import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Column gap="24">
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issue count and last update."
      />
      <ProjectsTable />
    </Column>
  );
}
