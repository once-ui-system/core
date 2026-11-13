"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

function statusVariant(status: ProjectStatus): "default" | "secondary" | "outline" {
  if (status === "Active") return "default";
  if (status === "Paused") return "secondary";
  return "outline";
}

export function ProjectsList() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const filtered = projects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.key.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || p.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="project-search">Search projects</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="project-search"
              type="search"
              placeholder="Search by name or key"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-11"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <Label htmlFor="project-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="project-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing {filtered.length} of {projects.length} projects
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No projects match your search. Try a different name or status.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden py-2 md:flex">
            <CardContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-12">Key</TableHead>
                    <TableHead className="h-12">Project</TableHead>
                    <TableHead className="h-12">Status</TableHead>
                    <TableHead className="h-12 text-right">Open issues</TableHead>
                    <TableHead className="h-12 text-right">Last updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((project) => (
                    <TableRow key={project.key}>
                      <TableCell className="py-4 font-mono text-sm font-semibold">{project.key}</TableCell>
                      <TableCell className="py-4 font-medium">{project.name}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right tabular-nums">{project.issues}</TableCell>
                      <TableCell className="py-4 text-right text-muted-foreground">
                        {formatDate(project.updated)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ul className="flex flex-col gap-4 md:hidden">
            {filtered.map((project) => (
              <li key={project.key}>
                <Card className="gap-3 py-5">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">{project.key}</p>
                        <p className="text-lg font-semibold">{project.name}</p>
                      </div>
                      <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.issues} open issues, updated {formatDate(project.updated)}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
