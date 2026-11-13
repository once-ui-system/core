import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      {/* Table on larger screens */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Projects in your workspace</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Project</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-5 py-3 font-semibold">Last updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-slate-50">
                <th scope="row" className="px-5 py-3 font-medium text-slate-900">
                  <span className="mr-2 inline-block w-10 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </th>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{p.issues}</td>
                <td className="px-5 py-3 text-slate-600">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards on phones */}
      <ul className="space-y-3 sm:hidden">
        {projects.map((p) => (
          <li key={p.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-slate-500">{p.key}</p>
                <h2 className="truncate text-base font-medium text-slate-900">{p.name}</h2>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <dl className="mt-3 flex gap-6 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Open issues</dt>
                <dd className="tabular-nums text-slate-800">{p.issues}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Updated</dt>
                <dd className="text-slate-800">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
