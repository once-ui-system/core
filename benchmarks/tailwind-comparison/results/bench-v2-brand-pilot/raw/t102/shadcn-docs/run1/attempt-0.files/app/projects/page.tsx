import type { Metadata } from "next";

import { formatDate, projects, type ProjectStatus } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { NewProjectButton } from "@/components/new-project-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Projects" };

const statusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "outline"
> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description="Every project your team is tracking, with open issues and when it last moved."
        action={<NewProjectButton />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All projects</CardTitle>
          <CardDescription>
            {projects.length} projects in the Acme Labs workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {project.key}
                  </TableCell>
                  <TableCell className="font-semibold">{project.name}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
