import type { Metadata } from "next";

import { PageTitle } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <PageTitle title="Reports" description="Issue load by project." />
      <Card>
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {projects.map((p) => {
              const pct = total === 0 ? 0 : Math.round((p.issues / total) * 100);
              return (
                <li key={p.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span> {p.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {p.issues} ({pct}%)
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${p.name} share of open issues`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 w-full overflow-hidden rounded-sm bg-muted"
                  >
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
