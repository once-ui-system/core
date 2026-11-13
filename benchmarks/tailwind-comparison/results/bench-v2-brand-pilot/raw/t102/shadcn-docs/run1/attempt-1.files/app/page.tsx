import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BugIcon,
  FolderKanbanIcon,
  PauseCircleIcon,
  TrendingUpIcon,
} from "lucide-react";

import { firstName, formatDate, projects, user } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) =>
    b.updated.localeCompare(a.updated),
  )[0];

  const summary = [
    {
      title: "Open issues",
      value: openIssues,
      note: `Across ${projects.length} projects`,
      icon: BugIcon,
    },
    {
      title: "Active projects",
      value: active.length,
      note: `${projects.length - active.length} paused or archived`,
      icon: FolderKanbanIcon,
    },
    {
      title: "Paused",
      value: paused.length,
      note: paused[0] ? `${paused[0].name} is on hold` : "Nothing on hold",
      icon: PauseCircleIcon,
    },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName(user.name)}!`}
        description="Here's how your team's work is shaping up today. Nice momentum, keep it going."
        action={
          <Button asChild>
            <Link href="/projects">
              View projects
              <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Summary"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {summary.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-base">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
                {item.title}
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.note}
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="reports"
        aria-label="Reports"
        className="grid scroll-mt-28 gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Where the work is piling up
            </CardTitle>
            <CardDescription>
              The project with the most open issues right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-semibold">
                  {busiest.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {busiest.key} · updated {formatDate(busiest.updated)}
                </span>
              </div>
              <Badge variant="secondary">{busiest.issues} open</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Latest activity</CardTitle>
            <CardDescription>
              The most recently updated project in your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-semibold">
                  {latest.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {latest.key} · updated {formatDate(latest.updated)}
                </span>
              </div>
              <TrendingUpIcon
                aria-hidden="true"
                className="size-6 shrink-0 text-primary"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
