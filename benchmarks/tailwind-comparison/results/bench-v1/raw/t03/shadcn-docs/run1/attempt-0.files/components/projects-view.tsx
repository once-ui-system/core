import { CreateProjectButton } from "@/components/action-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export function ProjectsView() {
  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in your workspace.`}
        actions={<CreateProjectButton />}
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Project</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Open issues</TableHead>
              <TableHead className="pr-4 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="pl-4 font-medium">{project.name}</TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {project.key}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{project.issues}</TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">
                  {formatDate(project.updated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
