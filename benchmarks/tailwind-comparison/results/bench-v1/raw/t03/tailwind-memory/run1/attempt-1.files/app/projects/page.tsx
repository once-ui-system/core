import { formatDate, projects } from "@/lib/data";

const statusStyle = {
  Active: "bg-emerald-500/15 text-emerald-600",
  Paused: "bg-amber-500/15 text-amber-600",
  Archived: "bg-slate-500/20 text-slate-500",
} as const;

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-1 text-sm opacity-70">{projects.length} projects in Acme Labs.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-500/25">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="bg-slate-500/10 text-xs uppercase tracking-wide opacity-80">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Project</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-4 py-3 font-medium">
                  <span className="mr-2 rounded bg-indigo-600/15 px-2 py-0.5 text-xs font-semibold text-indigo-500">
                    {p.key}
                  </span>
                  {p.name}
                </th>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{p.issues}</td>
                <td className="px-4 py-3">{formatDate(p.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
