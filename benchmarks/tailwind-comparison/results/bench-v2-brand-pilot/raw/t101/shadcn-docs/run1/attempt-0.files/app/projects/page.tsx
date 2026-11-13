import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects · ${totalIssues} open issues`}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Open issues
              </TableHead>
              <TableHead scope="col" className="text-right">
                Updated
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.key}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
