import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
