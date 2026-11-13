import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, totalIssues } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects, ${totalIssues} open issues in total.`}
      />
      <Card>
        <CardContent className="px-0">
          <Table>
            <TableCaption className="sr-only">Projects in the Acme Labs workspace</TableCaption>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="font-mono text-xs">{p.key}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
