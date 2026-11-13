import PageHeader from "@/components/PageHeader";
import ProjectsTable from "@/components/ProjectsTable";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and open issues."
      />
      <ProjectsTable />
    </>
  );
}
