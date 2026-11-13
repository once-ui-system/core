"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, type Project } from "@/lib/data";

const statusVariant = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
} as const;

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) =>
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Label htmlFor="project-search" className="sr-only">
          Search projects
        </Label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="project-search"
          type="search"
          placeholder="Search by name, key or status"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 bg-card pl-12 text-base"
        />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="h-14 px-6">Key</TableHead>
              <TableHead className="h-14 px-6">Project</TableHead>
              <TableHead className="h-14 px-6">Status</TableHead>
              <TableHead className="h-14 px-6 text-right">Open issues</TableHead>
              <TableHead className="h-14 px-6 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="px-6 py-5 font-mono text-sm">{p.key}</TableCell>
                <TableCell className="px-6 py-5 font-semibold">{p.name}</TableCell>
                <TableCell className="px-6 py-5">
                  <Badge variant={statusVariant[p.status]} className="px-3 py-1 text-xs">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5 text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="px-6 py-5 text-right whitespace-nowrap text-muted-foreground">
                  {formatDate(p.updated)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;. Try another word.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {rows.length} of {projects.length} projects.
      </p>
    </div>
  );
}
