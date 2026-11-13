import type { Metadata } from "next";

import { ProjectsTable } from "@/components/projects-table";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title="Projects" description="Every project in the Acme Labs workspace." />
      <ProjectsTable />
    </div>
  );
}
