import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import { DashboardContent } from "@/components/DashboardContent";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function DashboardPage() {
  return (
    <AppFrame>
      <DashboardContent />
    </AppFrame>
  );
}
