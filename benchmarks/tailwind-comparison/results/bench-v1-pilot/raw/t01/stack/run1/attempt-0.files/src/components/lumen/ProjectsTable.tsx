"use client";

import { Column, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export function ProjectsTable() {
  const data = {
    headers: [
      { content: "Project", key: "name", sortable: true },
      { content: "Key", key: "key", sortable: true, hide: { s: true } },
      { content: "Status", key: "status", sortable: true },
      { content: "Open issues", key: "issues", sortable: true, align: "right" as const },
      { content: "Updated", key: "updated", sortable: true, hide: { s: true } },
    ],
    rows: projects.map((project) => [
      <Row key="n" gap="8" vertical="center">
        <Text variant="label-strong-s">{project.name}</Text>
      </Row>,
      <Text key="k" variant="code-default-s" onBackground="neutral-weak">
        {project.key}
      </Text>,
      <Tag key="s" size="s" scheme={statusScheme[project.status]} label={project.status} />,
      <Text key="i" variant="body-default-s">
        {project.issues}
      </Text>,
      <Text key="u" variant="body-default-s" onBackground="neutral-weak">
        {formatDate(project.updated)}
      </Text>,
    ]),
  };

  return (
    <Column fillWidth overflowX="auto">
      <Table data={data} searchable searchPlaceholder="Search projects" />
    </Column>
  );
}
