import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title="Reports" description="Open issues by project." />
      <Card className="gap-2 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Open issues</CardTitle>
          <CardDescription className="text-xs">Counts as of the latest update to each project.</CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <ul className="grid gap-2">
            {projects.map((p) => (
              <li key={p.key} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-sm">
                <span className="truncate">{p.name}</span>
                <Progress value={(p.issues / max) * 100} aria-label={`${p.name}: ${p.issues} open issues`} className="h-1.5" />
                <span className="text-right tabular-nums">{p.issues}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
