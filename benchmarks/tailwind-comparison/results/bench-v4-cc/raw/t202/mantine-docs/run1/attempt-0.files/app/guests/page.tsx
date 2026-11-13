import type { Metadata } from "next";
import { GuestsScreen } from "@/components/GuestsScreen";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function Page() {
  return <GuestsScreen />;
}
