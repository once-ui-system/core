import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects, totalIssues } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const rows = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <div>
      <PageHeading title="Reports" description="Where the open work sits right now." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open issues by project</CardTitle>
          <CardDescription>
            Share of the {totalIssues} open issues in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2.5">
            {rows.map((p) => {
              const share = totalIssues === 0 ? 0 : Math.round((p.issues / totalIssues) * 100);
              return (
                <li key={p.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[10rem_minmax(0,1fr)_6rem]">
                  <span className="truncate">
                    <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                    {p.name}
                  </span>
                  <span className="text-right text-xs text-muted-foreground tabular-nums sm:order-3">
                    {p.issues} issues · {share}%
                  </span>
                  <Progress
                    value={share}
                    aria-label={`${p.name}: ${share}% of open issues`}
                    className="col-span-2 h-1.5 sm:order-2 sm:col-span-1"
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
