"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export function ProjectsTable() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-2 border-b p-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Filter projects"
            placeholder="Filter by name or key"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-7 text-sm"
          />
        </div>
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {rows.length} of {projects.length}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="h-8">Key</TableHead>
            <TableHead className="h-8">Name</TableHead>
            <TableHead className="h-8">Status</TableHead>
            <TableHead className="h-8 text-right">Open issues</TableHead>
            <TableHead className="h-8 text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No projects match &ldquo;{query}&rdquo;.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="py-1.5 font-mono text-xs">{p.key}</TableCell>
                <TableCell className="py-1.5 font-medium">{p.name}</TableCell>
                <TableCell className="py-1.5">
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="py-1.5 text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="py-1.5 text-right text-muted-foreground">{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
