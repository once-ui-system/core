import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <AppShell>
      <PageHeading title="Reports" description="Open issues by project." />
      <section
        aria-labelledby="issues-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="issues-heading" className="text-base font-semibold text-slate-900">
          Open issues ({total} total)
        </h2>
        <ul className="mt-4 space-y-4">
          {projects.map((p) => (
            <li key={p.key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-800">
                  <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </span>
                <span className="tabular-nums text-slate-600">{p.issues}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </div>
              <p className="sr-only">Last updated {formatDate(p.updated)}</p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
