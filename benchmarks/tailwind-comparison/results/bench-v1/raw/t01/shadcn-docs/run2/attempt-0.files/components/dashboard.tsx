import { AlertCircle, FolderKanban, Pause, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const stats = [
    {
      title: "Open issues",
      value: totalIssues,
      note: "Across all projects",
      icon: AlertCircle,
    },
    {
      title: "Active projects",
      value: active,
      note: "Currently in progress",
      icon: Activity,
    },
    {
      title: "Paused projects",
      value: paused,
      note: "Waiting to resume",
      icon: Pause,
    },
    {
      title: "Total projects",
      value: projects.length,
      note: "Including archived",
      icon: FolderKanban,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening across your workspace today.
        </p>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gap-3 py-5">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardDescription>{stat.title}</CardDescription>
              <stat.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>The projects your team touched most recently.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
                    {project.key}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(project.updated)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {project.issues} {project.issues === 1 ? "issue" : "issues"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
