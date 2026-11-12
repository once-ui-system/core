import type { Metadata } from "next"
import { AppShell } from "@/components/AppShell"
import { GuestsView } from "@/components/GuestsView"

export const metadata: Metadata = { title: "Guest list · Seatwise" }

export default function Page() {
  return (
    <AppShell title="Guest list">
      <GuestsView />
    </AppShell>
  )
}
