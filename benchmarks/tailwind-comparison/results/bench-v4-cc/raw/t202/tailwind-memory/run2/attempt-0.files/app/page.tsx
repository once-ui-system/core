import type { Metadata } from "next";
import { PlanView } from "@/components/plan/PlanView";

export const metadata: Metadata = { title: "Seating plan · Seatwise" };

export default function Page() {
  return <PlanView />;
}
