import type { Metadata } from "next";
import { AppFrame } from "@/components/seatwise/AppFrame";
import { PlanView } from "@/components/seatwise/PlanView";

export const metadata: Metadata = {
  title: "Seating plan · Seatwise",
  description: "Build the seating plan for Ines & Mateo's wedding dinner, table by table.",
};

export default function Page() {
  return (
    <AppFrame>
      <PlanView />
    </AppFrame>
  );
}
