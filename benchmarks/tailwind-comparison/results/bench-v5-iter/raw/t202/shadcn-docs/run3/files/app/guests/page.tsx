import type { Metadata } from "next"
import { GuestList } from "@/components/seatwise/guest-list"

export const metadata: Metadata = {
  title: "Guest list | Seatwise",
  description: "Search and filter the guest list, see each guest's table and the meal counts for the caterer.",
}

export default function GuestsPage() {
  return <GuestList />
}
