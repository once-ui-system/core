import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activeCount,
  formatDate,
  pausedCount,
  projects,
  totalIssues,
  user,
  workspace,
} from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const summary = [
    { label: "Active projects", value: String(activeCount), note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: String(totalIssues), note: "across all projects" },
    { label: "Paused projects", value: String(pausedCount), note: "Mobile beta" },
    { label: "Last activity", value: formatDate(latest[0].updated), note: latest[0].name },
  ];

  return (
    <div>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${workspace.name} has ${activeCount} active projects and ${totalIssues} open issues.`}
      />

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.note}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle className="text-base">Recently updated</CardTitle>
          <CardDescription>
            The latest changes across your projects.{" "}
            <Link href="/projects" className="text-primary underline underline-offset-4 hover:no-underline">
              View all projects
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {latest.slice(0, 3).map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={p.status} />
                  <span className="hidden w-24 text-right text-xs text-muted-foreground tabular-nums sm:inline">
                    {formatDate(p.updated)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
