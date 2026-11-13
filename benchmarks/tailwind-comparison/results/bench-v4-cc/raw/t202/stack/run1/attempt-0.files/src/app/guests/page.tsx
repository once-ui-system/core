import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = {
  title: "Guest list · Seatwise",
  description: "Search, filter and count the guests for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
