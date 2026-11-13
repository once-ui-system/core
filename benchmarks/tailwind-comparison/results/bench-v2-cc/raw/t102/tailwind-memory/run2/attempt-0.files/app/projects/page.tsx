import { formatDate, projects, statusStyles } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">Projects</h1>
        <p className="mt-3 text-lg text-sand-700">
          {projects.length} projects in your workspace, all in one cozy place.
        </p>
      </div>

      <ul className="flex flex-col gap-4 md:hidden">
        {projects.map((p) => (
          <li
            key={p.key}
            className="flex flex-col gap-3 rounded-ui border border-sand-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-bold text-sand-900">{p.name}</p>
                <p className="text-sm font-medium text-sand-600">{p.key}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[p.status]}`}
              >
                {p.status}
              </span>
            </div>
            <p className="text-sm text-sand-700">
              {p.issues} open {p.issues === 1 ? "issue" : "issues"} · Updated{" "}
              {formatDate(p.updated)}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-ui border border-sand-200 bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects in this workspace</caption>
          <thead className="bg-sand-100 text-sm text-sand-700">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Project</th>
              <th scope="col" className="px-6 py-4 font-semibold">Key</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-6 py-4 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-6 py-5 font-semibold text-sand-900">{p.name}</th>
                <td className="px-6 py-5 text-sand-700">{p.key}</td>
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right tabular-nums text-sand-900">{p.issues}</td>
                <td className="px-6 py-5 text-sand-700">{formatDate(p.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
