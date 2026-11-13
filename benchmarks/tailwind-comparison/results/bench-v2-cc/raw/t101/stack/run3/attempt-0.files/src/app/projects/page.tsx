import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects, {active} active.
        </Text>
      </Column>
      <ProjectsTable />
    </>
  );
}
