import type { Metadata } from "next";
import { ReportsList } from "@/components/ReportsList";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsList />;
}
