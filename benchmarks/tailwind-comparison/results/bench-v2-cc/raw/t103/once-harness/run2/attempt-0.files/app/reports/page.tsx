import { Column, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { PageHeader } from "../../components/PageHeader";
import { projects } from "../../lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, project) => sum + project.issues, 0);
  return (
    <Column fillWidth gap="24">
      <PageHeader
        title="Reports"
        description="Scheduled summaries of issue activity for your team."
      />
      <Column background="surface" border radius="m" padding="20" gap="8">
        <Text textVariant="label-strong-m">Weekly issue digest</Text>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Every Monday at 09:00 UTC, covering {total} open issues in {projects.length} projects.
        </Text>
      </Column>
    </Column>
  );
}
