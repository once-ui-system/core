import type { Metadata } from "next";

import { Card, PageHeading } from "@/components/ui";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageHeading title="Reports" description="Open issues per project, from the latest sync." />
      <Card aria-labelledby="issues-heading">
        <h2 id="issues-heading" className="mb-4 text-lg font-semibold">
          Open issues by project
        </h2>
        <ul className="flex flex-col gap-4">
          {projects.map((p) => (
            <li key={p.key} className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[3rem_10rem_1fr_2.5rem]">
              <span className="font-mono text-sm font-semibold text-brand">{p.key}</span>
              <span className="hidden text-sm sm:block">{p.name}</span>
              <span aria-hidden="true" className="h-3 overflow-hidden rounded-ui bg-raised">
                <span className="block h-full bg-brand" style={{ width: `${(p.issues / max) * 100}%` }} />
              </span>
              <span className="text-right font-mono text-sm">
                {p.issues}
                <span className="sr-only"> open issues in {p.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
