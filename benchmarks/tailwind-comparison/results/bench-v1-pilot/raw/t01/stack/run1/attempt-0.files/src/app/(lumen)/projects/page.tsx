import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "@/components/lumen/ProjectsTable";

export default function ProjectsPage() {
  return (
    <Column gap="24" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Every project in your workspace, with its open issue count and when it last changed.
        </Text>
      </Column>
      <ProjectsTable />
    </Column>
  );
}
