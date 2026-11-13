import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectsView />
    </AppShell>
  );
}
