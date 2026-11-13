import { Shell } from "@/components/Shell";
import { Schedule } from "@/components/Schedule";

export const metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
