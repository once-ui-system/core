import { PageHeader } from "@/components/page-header";
import { ProjectsTable } from "@/components/projects-table";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and how many issues are still open."
      />
      <ProjectsTable projects={projects} />
    </>
  );
}
