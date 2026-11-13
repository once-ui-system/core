import type { Metadata } from "next";
import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return <ProjectsTable />;
}
