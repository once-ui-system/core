"use client";

import { Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export function ProjectsTable() {
  const headers = [
    { content: "Key", key: "key", sortable: true, width: "96px" },
    { content: "Name", key: "name", sortable: true },
    { content: "Status", key: "status", sortable: true },
    { content: "Open issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];

  const rows = projects.map((project) => [
    <Text key="key" variant="code-default-s">
      {project.key}
    </Text>,
    <Text key="name" variant="label-default-s" onBackground="neutral-strong">
      {project.name}
    </Text>,
    <Tag key="status" as="span" size="s" scheme={statusScheme[project.status]} label={project.status} />,
    <Text key="issues" variant="body-default-s">
      {project.issues}
    </Text>,
    <Text key="updated" variant="body-default-s">
      {formatDate(project.updated)}
    </Text>,
  ]);

  return (
    <Table
      data={{ headers, rows }}
      compact
      searchable
      searchPlaceholder="Search projects"
      emptyState={<Text variant="body-default-s">No projects match your search.</Text>}
    />
  );
}
