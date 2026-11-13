import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CircleDot, FolderKanban, PauseCircle } from "lucide-react";

import { PageTitle } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { title: "Open issues", value: open, note: "Across all projects", icon: CircleDot },
    { title: "Active projects", value: active, note: `${projects.length} projects in total`, icon: FolderKanban },
    { title: "Paused projects", value: paused, note: "Waiting to resume", icon: PauseCircle },
    { title: "Last activity", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}`, icon: Activity },
  ];

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardDescription>{card.title}</CardDescription>
              <card.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold tabular-nums">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Busiest projects</CardTitle>
          <CardDescription>Projects with the most open issues.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {[...projects]
              .sort((a, b) => b.issues - a.issues)
              .slice(0, 3)
              .map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.key}</p>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {p.issues} open
                  </Badge>
                </li>
              ))}
          </ul>
          <Button asChild variant="link" className="mt-3 h-auto p-0">
            <Link href="/projects">View all projects</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
