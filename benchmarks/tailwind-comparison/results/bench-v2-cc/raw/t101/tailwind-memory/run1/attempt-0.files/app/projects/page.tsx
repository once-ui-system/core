import type { Metadata } from "next";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects | Lumen" };

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Projects</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          {projects.length} projects in the Acme Labs workspace.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead>
            <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="px-3 py-1.5 font-semibold">Key</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Name</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Status</th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">Issues</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-canvas">
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft">{p.key}</td>
                <th scope="row" className="px-3 py-1.5 font-medium text-ink">{p.name}</th>
                <td className="px-3 py-1.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{p.issues}</td>
                <td className="px-3 py-1.5 tabular-nums text-ink-soft">
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
