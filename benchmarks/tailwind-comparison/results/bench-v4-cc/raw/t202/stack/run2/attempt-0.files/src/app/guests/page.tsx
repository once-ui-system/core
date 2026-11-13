import type { Metadata } from "next";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guest list | Seatwise",
  description: "Guest list, tables and meal counts for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
