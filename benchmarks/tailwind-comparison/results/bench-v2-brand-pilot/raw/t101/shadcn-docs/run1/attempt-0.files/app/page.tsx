import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bug, FolderKanban, Pause } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const stats = [
    {
      label: "Active projects",
      value: active.length,
      note: `of ${projects.length} in the workspace`,
      icon: FolderKanban,
    },
    {
      label: "Open issues",
      value: openIssues,
      note: `${busiest.name} has the most (${busiest.issues})`,
      icon: Bug,
    },
    {
      label: "Paused",
      value: paused,
      note: "Mobile beta awaiting a release slot",
      icon: Pause,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
        actions={
          <Link href="/projects" className={cn(buttonVariants({ size: "sm" }))}>
            View projects <ArrowRight aria-hidden="true" />
          </Link>
        }
      />

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between text-xs">
                {s.label}
                <s.icon className="size-3.5" aria-hidden="true" />
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="recent-heading" className="mt-3">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-sm">
              Recently updated
            </CardTitle>
            <CardDescription className="text-xs">
              The three projects with the latest activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((p) => (
                <li key={p.key} className="flex items-center gap-3 py-1.5 text-sm">
                  <span className="w-10 font-mono text-xs text-muted-foreground">{p.key}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <Badge variant={p.status === "Active" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                  <time
                    dateTime={p.updated}
                    className="hidden w-24 text-right text-xs text-muted-foreground tabular-nums sm:block"
                  >
                    {formatDate(p.updated)}
                  </time>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
