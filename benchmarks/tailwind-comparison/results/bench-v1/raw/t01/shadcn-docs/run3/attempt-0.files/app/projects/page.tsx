import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> =
  {
    Active: "default",
    Paused: "secondary",
    Archived: "outline",
  };

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      {/* Phones: stacked cards */}
      <ul className="grid gap-3 md:hidden" aria-label="Projects">
        {projects.map((project) => (
          <li key={project.key}>
            <Card className="gap-3 py-4">
              <CardContent className="flex flex-col gap-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.key}
                    </p>
                  </div>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </div>
                <dl className="flex justify-between text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Open issues
                    </dt>
                    <dd className="tabular-nums">{project.issues}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-muted-foreground">Updated</dt>
                    <dd>
                      <time dateTime={project.updated}>
                        {formatDate(project.updated)}
                      </time>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <Card className="hidden py-2 md:block">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Open issues</TableHead>
                <TableHead className="px-4 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="px-4 font-mono text-xs">
                    {project.key}
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {project.issues}
                  </TableCell>
                  <TableCell className="px-4 text-right text-muted-foreground">
                    <time dateTime={project.updated}>
                      {formatDate(project.updated)}
                    </time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
