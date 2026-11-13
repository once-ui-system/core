import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const stats = [
    { label: "Active projects", value: active, note: `of ${projects.length} in your workspace`, icon: Rocket },
    { label: "Open issues", value: openIssues, note: "across all projects", icon: CircleDot },
    { label: "Paused projects", value: paused, note: "waiting to restart", icon: PauseCircle },
    { label: "Busiest project", value: "APP", note: "Customer app, 31 open issues", icon: FolderKanban },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Your team has {active} active projects and {openIssues} open issues. Here is how things look today.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/projects">
              View projects
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardDescription className="text-base">{stat.label}</CardDescription>
                <CardTitle className="text-4xl tabular-nums">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{stat.note}</CardContent>
            </Card>
          );
        })}
      </section>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-xl">
              Recently updated
            </CardTitle>
            <CardDescription>The projects your team touched most lately.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((project) => (
                <li key={project.key} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-sm font-bold text-secondary-foreground">
                      {project.key}
                    </span>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.issues} open issues, updated {formatDate(project.updated)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>{project.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
