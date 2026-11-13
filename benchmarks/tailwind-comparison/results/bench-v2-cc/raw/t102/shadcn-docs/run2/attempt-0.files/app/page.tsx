import Link from "next/link";
import { ArrowRight, Bug, FolderCheck, PauseCircle, Clock } from "lucide-react";

import { PageHeader } from "@/components/page-header";
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

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const stats = [
    { label: "Open issues", value: String(open), hint: "Across all projects", icon: Bug },
    { label: "Active projects", value: String(active), hint: "Moving along nicely", icon: FolderCheck },
    { label: "Paused projects", value: String(paused), hint: "Waiting for a restart", icon: PauseCircle },
    { label: "Latest update", value: formatDate(latest.updated), hint: latest.name, icon: Clock },
  ];

  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        description="Here is how things look across your workspace today. Your team has been busy."
      >
        <Button asChild className="h-12 px-6 text-base">
          <Link href="/projects">
            View projects
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </PageHeader>

      <section aria-labelledby="summary-heading" className="mb-10">
        <h2 id="summary-heading" className="sr-only">
          Summary
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="gap-4 py-7">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 text-sm font-medium">
                  <stat.icon className="size-4 text-primary" aria-hidden="true" />
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-3xl font-bold tracking-tight">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{stat.hint}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <Card className="py-7">
          <CardHeader>
            <CardTitle id="recent-heading" className="text-xl">
              Recently updated
            </CardTitle>
            <CardDescription>The three projects with the freshest activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((project) => (
                <li
                  key={project.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
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
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link
                href="/projects"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                See every project
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
