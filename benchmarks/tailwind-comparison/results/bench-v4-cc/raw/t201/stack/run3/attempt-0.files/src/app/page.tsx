import type { Metadata } from "next";
import Shell from "@/components/pawpoint/Shell";
import Schedule from "@/components/pawpoint/Schedule";

export const metadata: Metadata = {
  title: "Today’s schedule · Pawpoint",
  description: "Front desk schedule for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Shell current="schedule">
      <Schedule />
    </Shell>
  );
}
