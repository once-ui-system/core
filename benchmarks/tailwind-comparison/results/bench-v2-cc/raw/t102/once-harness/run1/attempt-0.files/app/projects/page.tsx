"use client";

import { Column, Heading, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, projects } from "@/lib/data";

const tone = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

const columns: TableColumn<Project>[] = [
  { key: "key", header: "Key", sortable: true, width: "6rem" },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag label={row.status} tone={tone[row.status]} size="s" />,
  },
  { key: "issues", header: "Open issues", sortable: true, align: "right" },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    cell: (row) => formatDate(row.updated),
  },
];

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={columns}
        rows={projects}
        getRowId={(row) => row.key}
        searchable
        searchPlaceholder="Search projects"
      />
    </Column>
  );
}
