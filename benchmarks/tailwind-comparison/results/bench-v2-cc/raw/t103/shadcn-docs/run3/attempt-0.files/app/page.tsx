import Link from "next/link";
import { Activity, Bug, FolderKanban, GitCommitHorizontal } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    {
      label: "Active projects",
      value: `${active.length} of ${projects.length}`,
      note: "1 paused, 1 archived",
      icon: FolderKanban,
    },
    {
      label: "Open issues",
      value: String(openIssues),
      note: "Across all projects",
      icon: Bug,
    },
    {
      label: "Busiest project",
      value: busiest.key,
      note: `${busiest.name}, ${busiest.issues} open issues`,
      icon: Activity,
    },
    {
      label: "Last activity",
      value: formatDate(latest.updated),
      note: `${latest.name} (${latest.key})`,
      icon: GitCommitHorizontal,
    },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Workspace summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label} className="gap-3">
              <CardHeader>
                <CardDescription className="flex items-center justify-between gap-2">
                  <span>{card.label}</span>
                  <card.icon className="size-4" aria-hidden="true" />
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="active-heading">
        <Card>
          <CardHeader>
            <CardTitle id="active-heading">Active work</CardTitle>
            <CardDescription>
              Projects with open issues.{" "}
              <Link href="/projects" className="text-primary underline-offset-4 hover:underline">
                View all projects
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {projects
                .filter((p) => p.issues > 0)
                .map((p) => (
                  <li key={p.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span>
                      <span className="truncate text-sm">{p.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {p.issues} issues
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
