"use client";

import { Row, Table, Tag, Text, type TableColumn } from "@once-ui-system/core";
import { formatDate, projects, statusTone, type Project } from "@/lib/data";

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    width: "6rem",
    sort: (a, b) => a.key.localeCompare(b.key),
    cell: (row) => <Text textVariant="code-default-s">{row.key}</Text>,
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
    sortable: true,
    sort: (a, b) => a.status.localeCompare(b.status),
    cell: (row) => (
      <Row>
        <Tag tone={statusTone[row.status]} label={row.status} size="s" />
      </Row>
    ),
  },
  {
    key: "issues",
    header: "Open issues",
    sortable: true,
    align: "right",
    sort: (a, b) => a.issues - b.issues,
    cell: (row) => <Text textVariant="body-default-s">{row.issues}</Text>,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    cell: (row) => <Text textVariant="body-default-s">{formatDate(row.updated)}</Text>,
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
      defaultSort={{ key: "updated", direction: "desc" }}
      searchable
      searchPlaceholder="Search projects"
      matchSearch={(row, query) =>
        `${row.key} ${row.name} ${row.status}`.toLowerCase().includes(query.toLowerCase())
      }
    />
  );
}
