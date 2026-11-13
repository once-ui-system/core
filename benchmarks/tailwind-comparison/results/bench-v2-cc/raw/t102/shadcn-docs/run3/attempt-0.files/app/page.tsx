import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active");
  const notActive = projects.length - active.length;
  const byRecent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const latest = byRecent[0];

  const stats = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects`, icon: CircleDot },
    { label: "Active projects", value: String(active.length), note: "Shipping right now", icon: FolderKanban },
    { label: "Paused or archived", value: String(notActive), note: "Resting for a while", icon: PauseCircle },
    { label: "Latest activity", value: formatDate(latest.updated), note: `${latest.key}: ${latest.name}`, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Your team has {openIssues} open issues across {active.length} active projects. Here is how things look today.
        </p>
      </section>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-4 py-7">
            <CardHeader className="gap-3 px-7">
              <div className="flex items-center justify-between gap-3">
                <CardDescription className="text-base">{stat.label}</CardDescription>
                <span className="flex size-10 items-center justify-center rounded-md bg-accent text-primary">
                  <stat.icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <CardTitle className="text-3xl leading-tight font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="px-7 text-sm text-muted-foreground">{stat.note}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Recently updated</CardTitle>
          <CardDescription className="text-base">The three projects your team touched most recently.</CardDescription>
        </CardHeader>
        <CardContent className="px-7">
          <ul className="divide-y">
            {byRecent.slice(0, 3).map((p) => (
              <li key={p.key} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
                    {p.key}
                  </Badge>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Updated {formatDate(p.updated)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{p.issues} open issues</p>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/projects">
                View all projects <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
