import { ProjectsTable } from "@/components/projects-table";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every project in your workspace, with its status and open issues.
        </p>
      </section>
      <ProjectsTable projects={projects} />
    </div>
  );
}
