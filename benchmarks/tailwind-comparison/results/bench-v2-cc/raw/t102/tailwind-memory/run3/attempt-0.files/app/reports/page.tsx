import type { Metadata } from "next";
import { Card, PageHeading } from "@/components/ui";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <>
      <PageHeading title="Reports">Open issues by project, at a glance.</PageHeading>
      <Card>
        <ul className="flex flex-col gap-6">
          {projects.map((p) => (
            <li key={p.key}>
              <div className="mb-2 flex justify-between text-base font-semibold text-sand-900">
                <span>{p.name}</span>
                <span className="tabular-nums">{p.issues}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-sand-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
