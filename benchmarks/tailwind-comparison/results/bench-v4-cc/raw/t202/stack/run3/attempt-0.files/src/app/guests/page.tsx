import type { Metadata } from "next";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guests",
  description: "Guest list, RSVPs, tables and meal counts for the wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
