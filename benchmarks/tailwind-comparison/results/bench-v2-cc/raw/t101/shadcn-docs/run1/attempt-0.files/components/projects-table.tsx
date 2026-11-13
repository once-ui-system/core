"use client"

import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, projects } from "@/lib/data"

export function ProjectsTable() {
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.key.toLowerCase().includes(q) ||
        project.status.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:max-w-xs">
        <Label htmlFor="project-filter">Filter projects</Label>
        <Input
          id="project-filter"
          type="search"
          placeholder="Name, key or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Project</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Open issues
              </TableHead>
              <TableHead scope="col">Last updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="font-mono text-xs">{project.key}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {project.issues}
                </TableCell>
                <TableCell className="tabular-nums">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {rows.length} of {projects.length} projects.
      </p>
    </div>
  )
}
