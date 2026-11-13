"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, type Project, type ProjectStatus } from "@/lib/data";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) =>
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q),
  );

  return (
    <Card className="py-6">
      <CardContent className="space-y-5">
        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="h-12 pl-11 text-base"
          />
        </div>
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="h-12">Key</TableHead>
              <TableHead className="h-12">Name</TableHead>
              <TableHead className="h-12">Status</TableHead>
              <TableHead className="h-12 text-right">Open issues</TableHead>
              <TableHead className="h-12 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="py-4 font-mono text-sm font-semibold">
                    {project.key}
                  </TableCell>
                  <TableCell className="py-4 font-medium">{project.name}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums">{project.issues}</TableCell>
                  <TableCell className="py-4 text-right whitespace-nowrap text-muted-foreground">
                    {formatDate(project.updated)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
