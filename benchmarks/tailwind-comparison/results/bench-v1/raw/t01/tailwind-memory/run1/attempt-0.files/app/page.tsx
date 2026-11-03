import { Activity, AlertCircle, FolderKanban, PauseCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects, user } from "@/lib/data";
import Link from "next/link";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const cards = [
    { label: "Open issues", value: openIssues, hint: `Across ${projects.length} projects`, Icon: AlertCircle },
    { label: "Active projects", value: active, hint: "Currently in development", Icon: FolderKanban },
    { label: "Paused projects", value: paused, hint: "Waiting on a decision", Icon: PauseCircle },
    { label: "Busiest project", value: busiest.key, hint: `${busiest.name}, ${busiest.issues} open`, Icon: Activity },
  ];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across your workspace today."
      />

      <section aria-label="Summary">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, hint, Icon }) => (
            <li key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-600">{label}</h2>
                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{hint}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="recent-heading" className="text-base font-semibold text-slate-900">
            Recently updated
          </h2>
          <Link
            href="/projects"
            className="rounded text-sm font-medium text-indigo-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            View all projects
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </p>
                <p className="text-xs text-slate-500">
                  Updated <time dateTime={p.updated}>{formatDate(p.updated)}</time> · {p.issues} open issues
                </p>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
