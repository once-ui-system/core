import Link from "next/link";
import { ChevronRight, Command, Frame, Map, PieChart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export function DashboardContent() {
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const archived = projects.filter((p) => p.status === "Archived");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const summary = [
    {
      title: "Open issues",
      value: String(openIssues),
      hint: `Across ${projects.length} projects`,
      icon: PieChart,
    },
    {
      title: "Active projects",
      value: String(active.length),
      hint: `${paused.length} paused, ${archived.length} archived`,
      icon: Frame,
    },
    {
      title: "Busiest project",
      value: busiest.key,
      hint: `${busiest.name}, ${busiest.issues} open issues`,
      icon: Map,
    },
    {
      title: "Your role",
      value: user.role,
      hint: `Signed in as ${user.email}`,
      icon: Command,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening across your projects today.
        </p>
      </div>

      <section
        aria-label="Summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="gap-3 py-5">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardDescription>{item.title}</CardDescription>
                <Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tabular-nums">
                  {item.value}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>
            The projects your team touched most recently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {project.key}
                  </Badge>
                  <span className="truncate font-medium">{project.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {project.issues} open · updated {formatDate(project.updated)}
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/projects">
              View all projects
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
