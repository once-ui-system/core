import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guests: Seatwise" };

export default function Page() {
  return <GuestsView />;
}
