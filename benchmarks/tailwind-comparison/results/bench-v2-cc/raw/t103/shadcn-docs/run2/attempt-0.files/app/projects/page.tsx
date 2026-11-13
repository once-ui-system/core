import type { Metadata } from "next";

import { PageTitle } from "@/components/app-shell";
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

const variants: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <>
      <PageTitle title="Projects" description={`${projects.length} projects in the Acme Labs workspace.`} />
      <Card className="py-0">
        <Table>
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Issues</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-mono text-xs">{p.key}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant={variants[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                  {formatDate(p.updated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
