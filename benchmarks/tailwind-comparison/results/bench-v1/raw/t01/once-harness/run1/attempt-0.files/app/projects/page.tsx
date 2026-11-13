import type { Metadata } from "next";
import { Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issue count."
      />
      <Row gap="12" vertical="center" wrap>
        <Tag tone="success" size="s" label={`${active} active`} />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects in total
        </Text>
      </Row>
      <ProjectsTable />
    </>
  );
}
