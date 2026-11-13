import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeading title="Reports" description="Where open issues are concentrated." />
      <Card>
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {projects.map((p) => {
              const share = total === 0 ? 0 : Math.round((p.issues / total) * 100);
              return (
                <li key={p.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                      {p.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {p.issues} ({share}%)
                    </span>
                  </div>
                  <Progress value={share} aria-label={`${p.name}: ${share}% of open issues`} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
