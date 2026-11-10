import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "../../components/ProjectsTable";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Every project your team tracks in Lumen, with open issues and the last update.
        </Text>
      </Column>
      <ProjectsTable />
    </Column>
  );
}
