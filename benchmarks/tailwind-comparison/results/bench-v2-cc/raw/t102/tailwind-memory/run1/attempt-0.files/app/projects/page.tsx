import type { Metadata } from "next";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

const badge: Record<ProjectStatus, string> = {
  Active: "bg-brand-100 text-brand-900",
  Paused: "bg-sand-200 text-sand-900",
  Archived: "bg-sunken text-muted ring-1 ring-line",
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge[status]}`}>
      {status}
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Projects</h1>
        <p className="text-lg text-muted">
          {projects.length} projects in your workspace, from the marketing site to internal tools.
        </p>
      </div>

      {/* Phones: cards */}
      <ul className="flex flex-col gap-4 md:hidden">
        {projects.map((p) => (
          <li key={p.key} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{p.name}</p>
                <p className="text-sm text-muted">{p.key}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-muted">
              {p.issues} open {p.issues === 1 ? "issue" : "issues"} &middot; updated{" "}
              <time dateTime={p.updated}>{formatDate(p.updated)}</time>
            </p>
          </li>
        ))}
      </ul>

      {/* Larger screens: table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects in the workspace</caption>
          <thead className="bg-sunken text-sm text-muted">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Project</th>
              <th scope="col" className="px-6 py-4 font-semibold">Key</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-6 py-4 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-6 py-5 font-semibold">{p.name}</th>
                <td className="px-6 py-5 font-mono text-sm text-muted">{p.key}</td>
                <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
                <td className="px-6 py-5 text-right tabular-nums">{p.issues}</td>
                <td className="px-6 py-5 text-muted">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
