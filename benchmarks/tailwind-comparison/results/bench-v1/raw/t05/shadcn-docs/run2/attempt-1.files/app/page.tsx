import type { Metadata } from "next"

import { MembersTable } from "@/components/team/members-table"
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/data"

export const metadata: Metadata = {
  title: `Team · ${PRODUCT_NAME}`,
  description: PRODUCT_TAGLINE,
}

export default function TeamPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {PRODUCT_NAME} workspace · Acme Labs
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Team
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Manage who can see and edit your dashboards, reports and issues.
          Invite teammates, adjust roles, or remove access at any time.
        </p>
      </header>
      <MembersTable />
    </main>
  )
}
