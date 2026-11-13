import type { Metadata } from "next";
import { GuestsView } from "@/components/guests/GuestsView";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function GuestsPage() {
  return <GuestsView />;
}
