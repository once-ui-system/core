import type { Metadata } from "next";
import { AppFrame } from "../../components/AppFrame";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
