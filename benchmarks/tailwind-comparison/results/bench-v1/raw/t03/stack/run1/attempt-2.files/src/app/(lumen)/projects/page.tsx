import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsView } from "@/components/lumen/ProjectsView";

export const metadata: Metadata = {
  title: "Projects · Lumen",
  description: "Every product your team tracks in Lumen.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsView />
    </Suspense>
  );
}
