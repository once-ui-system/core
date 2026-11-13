import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusStyle: Record<ProjectStatus, string> = {
  Active: "border-brand text-brand",
  Paused: "border-line text-fg",
  Archived: "border-line text-muted",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} projects in the Acme Labs workspace.
          </p>
        </div>
        <button type="button" className="btn-primary self-start sm:self-auto">
          New project
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead>
            <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Key</th>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Issues</th>
              <th scope="col" className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.key} className="border-b border-line last:border-b-0 hover:bg-raised/60">
                <td className="px-4 py-3 font-mono font-semibold">{p.key}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{p.issues}</td>
                <td className="px-4 py-3 text-muted">
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
