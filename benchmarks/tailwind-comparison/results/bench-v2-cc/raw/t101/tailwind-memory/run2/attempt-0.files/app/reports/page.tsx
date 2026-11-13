import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageTitle title="Reports" description="Open issues per project." />
      <section
        aria-label="Open issues by project"
        className="rounded-sm border border-line bg-surface p-3"
      >
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm">{project.name}</span>
              <div className="h-2 flex-1 rounded-sm bg-slate-100" aria-hidden="true">
                <div
                  className="h-2 rounded-sm bg-brand"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm tabular-nums">
                {project.issues}
                <span className="sr-only"> open issues</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
