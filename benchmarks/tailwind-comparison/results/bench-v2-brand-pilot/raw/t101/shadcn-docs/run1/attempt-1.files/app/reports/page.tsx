import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const rows = [...projects]
    .filter((p) => p.issues > 0)
    .sort((a, b) => b.issues - a.issues);
  const max = Math.max(...rows.map((p) => p.issues), 1);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Open issues by project, from the latest sync."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm">Open issues by project</CardTitle>
          <CardDescription className="text-xs">
            Projects with no open issues are omitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {rows.map((p) => (
              <li
                key={p.key}
                className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm"
              >
                <span className="truncate">{p.name}</span>
                <span className="h-2 bg-muted" aria-hidden="true">
                  <span
                    className="block h-2 bg-primary"
                    style={{ width: `${(p.issues / max) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">{p.issues}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
