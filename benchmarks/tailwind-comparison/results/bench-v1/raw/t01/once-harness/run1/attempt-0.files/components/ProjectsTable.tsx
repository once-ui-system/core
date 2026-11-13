"use client";

import { Row, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "@/lib/data";

const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    sort: (a, b) => a.key.localeCompare(b.key),
    cell: (row) => <Text textVariant="code-default-s">{row.key}</Text>,
    width: "6rem",
  },
  {
    key: "name",
    header: "Project",
    sortable: true,
    sort: (a, b) => a.name.localeCompare(b.name),
    cell: (row) => <Text textVariant="label-strong-s">{row.name}</Text>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <Row>
        <Tag tone={statusTone[row.status]} size="s" label={row.status} />
      </Row>
    ),
  },
  {
    key: "issues",
    header: "Open issues",
    align: "right",
    sortable: true,
    sort: (a, b) => a.issues - b.issues,
    cell: (row) => <Text>{row.issues}</Text>,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    cell: (row) => <Text>{formatDate(row.updated)}</Text>,
    hide: { s: true },
  },
];

export function ProjectsTable() {
  return (
    <Table<Project>
      aria-label="Projects"
      columns={columns}
      rows={projects}
      getRowId={(row) => row.key}
      searchable
      searchPlaceholder="Search projects"
      matchSearch={(row, q) =>
        `${row.key} ${row.name} ${row.status}`.toLowerCase().includes(q.toLowerCase())
      }
      defaultSort={{ key: "updated", direction: "desc" }}
    />
  );
}
