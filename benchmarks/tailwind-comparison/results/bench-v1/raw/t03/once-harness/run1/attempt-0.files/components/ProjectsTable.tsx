"use client";

import { Table } from "@once-ui-system/core";
import type { TableColumn } from "@once-ui-system/core";
import { formatDate, projects, type Project } from "@/lib/data";
import { StatusTag } from "./StatusTag";

const columns: TableColumn<Project>[] = [
  { key: "key", header: "Key", sortable: true, width: "6rem" },
  { key: "name", header: "Project", sortable: true },
  { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
  {
    key: "issues",
    header: "Open issues",
    align: "right",
    sortable: true,
    sort: (a, b) => a.issues - b.issues,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    hide: { s: true },
    cell: (row) => formatDate(row.updated),
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
    />
  );
}
