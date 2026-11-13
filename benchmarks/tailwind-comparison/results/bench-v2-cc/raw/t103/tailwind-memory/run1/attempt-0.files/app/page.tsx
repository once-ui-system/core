import Link from "next/link";
import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects, summary, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

const cards = [
  { label: "Active projects", value: summary.activeProjects, note: "Shipping this quarter" },
  { label: "Open issues", value: summary.openIssues, note: "Across all projects" },
  { label: "Paused projects", value: summary.pausedProjects, note: "Waiting on a decision" },
  { label: "Archived projects", value: summary.archivedProjects, note: "Read-only history" },
];

export default function DashboardPage() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label} className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-sm font-medium text-muted">{card.label}</h2>
            <p className="mt-2 font-mono text-4xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.note}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent" className="mt-10 rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="recent" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm text-brand-400 underline hover:text-brand-300">
            View all projects
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((project) => (
            <li key={project.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-xs">
                  {project.key}
                </span>
                <span className="font-medium">{project.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted">
                <StatusBadge status={project.status} />
                <span>{formatDate(project.updated)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
