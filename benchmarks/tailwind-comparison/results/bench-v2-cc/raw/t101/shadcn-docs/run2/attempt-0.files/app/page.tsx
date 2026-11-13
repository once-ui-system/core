import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { title: "Open issues", value: String(open), note: `Across ${projects.length} projects` },
    { title: "Active projects", value: String(active), note: `${projects.length - active} paused or archived` },
    { title: "Busiest project", value: "Customer app", note: "31 open issues" },
    { title: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title} className="gap-1 py-3">
            <CardHeader className="gap-0 px-3">
              <CardDescription className="text-xs">{c.title}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{c.value}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 text-xs text-muted-foreground">{c.note}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-3 gap-2 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Recently updated</CardTitle>
          <CardDescription className="text-xs">
            The latest changes in your workspace.{" "}
            <Link href="/projects" className="text-primary underline underline-offset-2">
              View all projects
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Project</TableHead>
                <TableHead className="h-8">Status</TableHead>
                <TableHead className="h-8 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...projects]
                .sort((a, b) => b.updated.localeCompare(a.updated))
                .slice(0, 3)
                .map((p) => (
                  <TableRow key={p.key}>
                    <TableCell className="p-1.5 px-2">{p.name}</TableCell>
                    <TableCell className="p-1.5 px-2">
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="p-1.5 px-2 text-right text-muted-foreground">
                      {formatDate(p.updated)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
