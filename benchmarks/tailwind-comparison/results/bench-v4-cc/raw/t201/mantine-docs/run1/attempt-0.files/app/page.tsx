import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <AppFrame>
      <Schedule />
    </AppFrame>
  );
}
