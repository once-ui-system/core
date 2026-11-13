import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
