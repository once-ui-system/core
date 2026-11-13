import type { Metadata } from "next";
import { GuestsView } from "@/components/guests-view";

export const metadata: Metadata = { title: "Guests" };

export default function Page() {
  return <GuestsView />;
}
