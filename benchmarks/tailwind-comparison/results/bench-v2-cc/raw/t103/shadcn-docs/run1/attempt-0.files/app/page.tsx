import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Clock } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, reports, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const cards = [
    { title: "Open issues", value: String(open), note: `${busiest.name} has the most (${busiest.issues})`, icon: CircleDot },
    { title: "Active projects", value: String(active), note: `of ${projects.length} in the workspace`, icon: FolderKanban },
    { title: "Paused", value: String(paused), note: "Mobile beta is waiting on a decision", icon: PauseCircle },
    { title: "Last update", value: formatDate(latest.updated), note: latest.name, icon: Clock },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email} ({user.role}). Here is where your projects stand today.
        </p>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <card.icon className="size-4 text-primary" aria-hidden="true" />
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-base">
              Recently updated
            </CardTitle>
            <CardDescription>The three projects touched most recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {[...projects]
                .sort((a, b) => b.updated.localeCompare(a.updated))
                .slice(0, 3)
                .map((p) => (
                  <li key={p.key} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                    <span className="w-12 font-mono text-sm text-muted-foreground">{p.key}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                    <StatusBadge status={p.status} />
                    <time dateTime={p.updated} className="text-sm text-muted-foreground">
                      {formatDate(p.updated)}
                    </time>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="reports" aria-labelledby="reports-heading" className="scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle id="reports-heading" className="text-base">
              Reports
            </CardTitle>
            <CardDescription>Scheduled reports for the Acme Labs workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4 md:grid-cols-3">
              {reports.map((r) => (
                <li key={r.title} className="flex flex-col gap-1 rounded-md border p-4">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{r.cadence}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <div>
        <Button asChild>
          <Link href="/projects">
            View all projects
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </>
  );
}
