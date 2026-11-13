"use client";

import { Column, Heading, Tag, Text, type TableColumn, Table } from "@once-ui-system/core";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

const columns: TableColumn<Project>[] = [
  { key: "key", header: "Key", sortable: true, width: "6rem" },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag size="s" tone={statusTone(row.status)} label={row.status} />,
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
    <Column gap="16">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={columns}
        rows={projects}
        getRowId={(row) => row.key}
        searchable
        searchPlaceholder="Search projects"
        compact
      />
    </Column>
  );
}
