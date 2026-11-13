import Link from "next/link"
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { firstName, formatDate, projects, user } from "@/lib/data"

export const metadata: Metadata = { title: "Overview" }

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const paused = projects.filter((p) => p.status === "Paused").length
  const archived = projects.filter((p) => p.status === "Archived").length
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3)

  const summary = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused", value: paused, note: "waiting to resume" },
    { label: "Archived", value: archived, note: "read-only" },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(user.name)}`}
        description={`Here is where ${projects.length} projects stand today.`}
      />

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.note}</CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>The three projects touched most recently.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Project</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Open issues
                </TableHead>
                <TableHead scope="col">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-medium">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {project.key}
                    </span>
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{project.issues}</TableCell>
                  <TableCell className="tabular-nums">
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent>
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link href="/projects">View all projects</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
