import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  const headers = [
    { content: "Key", key: "key", sortable: true },
    { content: "Project", key: "name", sortable: true },
    { content: "Status", key: "status" },
    { content: "Issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];

  const rows = projects.map((p) => [
    p.key,
    p.name,
    <Tag key={`${p.key}-status`} size="s" scheme={statusScheme[p.status]} label={p.status} />,
    String(p.issues),
    formatDate(p.updated),
  ]);

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table data={{ headers, rows }} compact searchable searchPlaceholder="Search projects" />
      </Column>
    </>
  );
}

import { Table } from "@once-ui-system/core";
