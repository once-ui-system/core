import type { Metadata } from "next";

import { PageHeading } from "@/components/ui";
import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading title="Projects" description="Every project in the workspace, with its open issues and last activity." />
      <ProjectsTable />
    </>
  );
}
