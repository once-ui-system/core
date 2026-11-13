import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { ProjectsTable } from "@/components/projects-table"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issues."
      />
      <ProjectsTable />
    </>
  )
}
