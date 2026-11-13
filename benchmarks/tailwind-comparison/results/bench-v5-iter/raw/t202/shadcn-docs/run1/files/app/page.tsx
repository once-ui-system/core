import type { Metadata } from "next"
import { PlanView } from "@/components/seatwise/plan-view"

export const metadata: Metadata = { title: "Seating plan" }

export default function Page() {
  return <PlanView />
}
