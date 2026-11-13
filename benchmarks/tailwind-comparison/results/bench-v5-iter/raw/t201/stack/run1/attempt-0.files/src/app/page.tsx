import { Shell } from "@/components/pawpoint/Shell";
import { Schedule } from "@/components/pawpoint/Schedule";

export const metadata = {
  title: "Today's schedule · Pawpoint",
  description: "Front-desk schedule, check-in and waiting room for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
