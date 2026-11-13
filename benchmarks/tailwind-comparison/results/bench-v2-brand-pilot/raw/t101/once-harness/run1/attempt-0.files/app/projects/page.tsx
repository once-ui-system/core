import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ProjectsTable } from "../../components/ProjectsTable";
import { totals } from "../../lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Column gap="16">
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="12"
        s={{ direction: "column", horizontal: "start" }}
      >
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Projects
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {totals.projects} projects, {totals.openIssues} open issues in total.
          </Text>
        </Column>
        <Button size="s" prefixIcon="plus" label="New project" />
      </Row>
      <ProjectsTable />
    </Column>
  );
}
