import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import { projects, summary } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageHeading
        title="Reports"
        description={`${summary.openIssues} open issues, broken down by project.`}
      />

      <section aria-labelledby="by-project" className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id="by-project" className="text-lg font-semibold">
          Open issues by project
        </h2>
        <ul className="mt-5 space-y-4">
          {projects.map((project) => (
            <li key={project.key} className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2.5rem]">
              <span className="truncate">
                <span className="font-mono">{project.key}</span>
                <span className="hidden text-muted sm:inline"> {project.name}</span>
              </span>
              <span aria-hidden="true" className="h-3 rounded-sm bg-raised">
                <span
                  className="block h-3 rounded-sm bg-brand-500"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono">{project.issues}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
