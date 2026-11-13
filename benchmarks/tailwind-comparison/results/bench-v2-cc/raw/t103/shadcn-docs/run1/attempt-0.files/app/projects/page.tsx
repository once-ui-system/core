import type { Metadata } from "next";

import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projects in the Acme Labs workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All projects</CardTitle>
          <CardDescription>Status, open issues and the date of the last update.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Key</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Issues</TableHead>
                <TableHead scope="col" className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-mono text-muted-foreground">{p.key}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
