import type { Metadata } from "next";
import { PlanScreen } from "@/components/PlanScreen";

export const metadata: Metadata = { title: "Seating plan · Seatwise" };

export default function Page() {
  return <PlanScreen />;
}
