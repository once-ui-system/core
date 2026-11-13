import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-brand-200 bg-brand-50 text-brand-800",
  Paused: "border-slate-300 bg-slate-100 text-slate-700",
  Archived: "border-slate-200 bg-white text-slate-500",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="mt-0.5 text-slate-600">{projects.length} projects in this workspace.</p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="w-16 px-3 py-1.5 font-medium">
                Key
              </th>
              <th scope="col" className="px-3 py-1.5 font-medium">
                Name
              </th>
              <th scope="col" className="w-24 px-3 py-1.5 font-medium">
                Status
              </th>
              <th scope="col" className="w-16 px-3 py-1.5 text-right font-medium">
                Issues
              </th>
              <th scope="col" className="hidden w-32 px-3 py-1.5 font-medium sm:table-cell">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 font-mono text-xs text-slate-600">{p.key}</td>
                <td className="truncate px-3 py-1.5 font-medium text-slate-900">{p.name}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={`inline-block rounded-md border px-1.5 text-xs font-medium ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{p.issues}</td>
                <td className="hidden px-3 py-1.5 text-slate-600 sm:table-cell">
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
