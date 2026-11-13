import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = {
  title: "Seating plan · Seatwise",
  description: "Build the seating plan for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <PlanView />;
}
