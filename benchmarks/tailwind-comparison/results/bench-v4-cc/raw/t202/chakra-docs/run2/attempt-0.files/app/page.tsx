import type { Metadata } from "next";
import { PlanView } from "@/components/plan-view";

export const metadata: Metadata = { title: "Plan" };

export default function Page() {
  return <PlanView />;
}
