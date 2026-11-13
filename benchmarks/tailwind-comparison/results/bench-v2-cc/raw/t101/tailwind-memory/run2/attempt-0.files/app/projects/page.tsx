import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageTitle
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <div className="overflow-x-auto rounded-sm border border-line bg-surface">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Key
              </th>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Name
              </th>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Status
              </th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                Issues
              </th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.key} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-ink-muted">
                  {project.key}
                </td>
                <th scope="row" className="px-3 py-1.5 font-medium">
                  {project.name}
                </th>
                <td className="px-3 py-1.5">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{project.issues}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right text-ink-muted">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
