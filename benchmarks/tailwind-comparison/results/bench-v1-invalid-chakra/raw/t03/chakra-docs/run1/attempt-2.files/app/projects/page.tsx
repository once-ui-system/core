import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { ProjectsTable } from "@/components/projects-table"

export const metadata = { title: "Projects · Lumen" }

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="Every project your team is tracking, with open issue counts and when it last changed."
      />
      <ProjectsTable />
    </AppShell>
  )
}
