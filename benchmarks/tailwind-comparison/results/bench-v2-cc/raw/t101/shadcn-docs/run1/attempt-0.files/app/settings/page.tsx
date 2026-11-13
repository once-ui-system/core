import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings-form"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile and notification preferences."
      />
      <SettingsForm />
    </>
  )
}
