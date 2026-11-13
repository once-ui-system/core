import type { Metadata } from "next";

import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Every project in the Acme Labs workspace and its open issues.
        </p>
      </div>
      <ProjectsTable />
    </div>
  );
}
