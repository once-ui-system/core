"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function ProjectsTable() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Card className="gap-4 py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, key or status"
          aria-label="Filter projects"
          className="max-w-sm"
        />

        <Table>
          <TableCaption className="sr-only">
            Projects with status, open issues and last update date
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Issues
              </TableHead>
              <TableHead scope="col" className="text-right">
                Updated
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="font-mono text-xs">{project.key}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {project.issues}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No projects match “{query}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="sr-only" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"} shown
        </p>
      </CardContent>
    </Card>
  );
}
