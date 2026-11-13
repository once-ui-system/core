import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Seatwise | Guest list" };

export default function Page() {
  return <GuestsView />;
}
