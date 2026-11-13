import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "./ProjectsTable";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Every project in Acme Labs, with its status and open issues.
        </Text>
      </Column>
      <ProjectsTable />
    </>
  );
}
