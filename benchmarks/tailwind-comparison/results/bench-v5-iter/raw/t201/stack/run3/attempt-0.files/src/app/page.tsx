import type { Metadata } from "next";
import { DeskShell } from "@/components/desk/DeskShell";
import { Schedule } from "@/components/desk/Schedule";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front-desk schedule, waiting list and bookings for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <DeskShell>
      <Schedule />
    </DeskShell>
  );
}
