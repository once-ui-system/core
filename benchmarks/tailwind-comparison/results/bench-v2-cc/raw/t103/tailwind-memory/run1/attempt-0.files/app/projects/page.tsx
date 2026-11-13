import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-line bg-raised font-mono text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Key
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Issues
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.key} className="hover:bg-raised/60">
                <td className="px-4 py-3 font-mono">{project.key}</td>
                <th scope="row" className="px-4 py-3 font-medium">
                  {project.name}
                </th>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono">{project.issues}</td>
                <td className="px-4 py-3 text-muted">
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
