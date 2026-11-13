import type { Metadata } from "next"
import { GuestsView } from "@/components/seatwise/guests-view"
import { PageShell } from "@/components/seatwise/page-shell"

export const metadata: Metadata = { title: "Guests · Seatwise" }

export default function GuestsPage() {
  return (
    <PageShell>
      <GuestsView />
    </PageShell>
  )
}
