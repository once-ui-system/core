import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused projects", value: paused, note: "waiting on a decision" },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where the workspace stands today."
      />

      <section aria-label="Summary">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li
              key={card.label}
              className="rounded-sm border border-line bg-surface px-3 py-2.5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                {card.label}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{card.value}</p>
              <p className="mt-0.5 text-xs text-ink-subtle">{card.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="recent-heading" className="font-serif text-base font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium text-brand hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-sm border border-line bg-surface">
          {recent.map((project) => (
            <li key={project.key} className="flex items-center gap-3 px-3 py-2">
              <span className="w-10 shrink-0 font-mono text-xs font-semibold text-ink-muted">
                {project.key}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
              <StatusBadge status={project.status} />
              <span className="hidden w-24 shrink-0 text-right text-xs text-ink-subtle sm:block">
                {formatDate(project.updated)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
