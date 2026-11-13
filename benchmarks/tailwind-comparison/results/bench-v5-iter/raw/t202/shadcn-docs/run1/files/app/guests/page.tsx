import type { Metadata } from "next"
import { GuestsView } from "@/components/seatwise/guests-view"

export const metadata: Metadata = { title: "Guest list" }

export default function Page() {
  return <GuestsView />
}
