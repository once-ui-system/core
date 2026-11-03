import { AppShell } from "@/components/app-shell"
import { MembersTable } from "@/components/members-table"
import { PageHeader } from "@/components/page-header"

export const metadata = { title: "Members · Lumen" }

export default function MembersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="People in the Acme Labs workspace, their roles and whether they've accepted their invitation."
      />
      <MembersTable />
    </AppShell>
  )
}
