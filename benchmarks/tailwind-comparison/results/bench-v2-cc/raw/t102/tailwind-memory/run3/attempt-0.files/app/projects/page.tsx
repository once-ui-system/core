import type { Metadata } from "next";
import { Card, PageHeading, StatusBadge } from "@/components/ui";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading title="Projects">
        Everything your team is building, with its open issues and latest activity.
      </PageHeading>

      {/* Table on larger screens */}
      <Card className="hidden overflow-x-auto !p-0 md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-sand-200 text-sm text-sand-600">
            <tr>
              <th scope="col" className="px-8 py-5 font-semibold">Project</th>
              <th scope="col" className="px-4 py-5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-5 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-8 py-5 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-sand-50">
                <th scope="row" className="px-8 py-5 font-semibold text-sand-900">
                  {p.name}
                  <span className="ml-3 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-bold tracking-wide text-sand-700">
                    {p.key}
                  </span>
                </th>
                <td className="px-4 py-5"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-5 text-right tabular-nums text-sand-800">{p.issues}</td>
                <td className="px-8 py-5 text-sand-700">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Cards on phones */}
      <ul className="grid gap-4 md:hidden">
        {projects.map((p) => (
          <li key={p.key}>
            <Card className="!p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-sand-900">{p.name}</h2>
                  <p className="text-sm font-semibold tracking-wide text-sand-600">{p.key}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-sand-600">Open issues</dt>
                  <dd className="mt-1 text-base font-semibold text-sand-900">{p.issues}</dd>
                </div>
                <div>
                  <dt className="text-sand-600">Updated</dt>
                  <dd className="mt-1 text-base font-semibold text-sand-900">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </dd>
                </div>
              </dl>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
