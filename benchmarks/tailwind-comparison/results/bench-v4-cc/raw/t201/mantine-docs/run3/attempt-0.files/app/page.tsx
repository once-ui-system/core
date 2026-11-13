import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule · Pawpoint" };

export default function Page() {
  return <Schedule />;
}
