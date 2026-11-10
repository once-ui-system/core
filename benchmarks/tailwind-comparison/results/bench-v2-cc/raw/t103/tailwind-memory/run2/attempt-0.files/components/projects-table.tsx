"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { StatusBadge, inputClasses } from "@/components/ui";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

type Filter = "All" | ProjectStatus;

export function ProjectsTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Filter>("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or key"
            className={`${inputClasses} pl-9`}
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="project-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Filter)}
            className={inputClasses}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-ui border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <thead className="border-b border-line bg-raised text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Key</th>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-mono font-semibold">Issues</th>
              <th scope="col" className="px-4 py-3 text-right font-mono font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No projects match your filters.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.key} className="hover:bg-raised/60">
                  <th scope="row" className="px-4 py-3 font-mono font-semibold text-brand">{p.key}</th>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right font-mono">{p.issues}</td>
                  <td className="px-4 py-3 text-right text-muted">{formatDate(p.updated)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p role="status" className="mt-3 text-sm text-muted">
        Showing {rows.length} of {projects.length} projects
      </p>
    </div>
  );
}
