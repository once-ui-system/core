import type { Metadata } from "next";
import { GuestsView } from "@/components/guests/GuestsView";

export const metadata: Metadata = {
  title: "Guests · Seatwise",
};

export default function Page() {
  return <GuestsView />;
}
