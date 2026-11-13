import type { Metadata } from "next";
import { PlanView } from "@/components/seatwise/PlanView";

export const metadata: Metadata = {
  title: "Seating plan | Seatwise",
  description: "Seating plan for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export default function Page() {
  return <PlanView />;
}
