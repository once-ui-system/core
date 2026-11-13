"use client";

import { Table } from "@once-ui-system/core";
import { formatDate, projects } from "@/lib/data";
import { StatusTag } from "./StatusTag";

export function ProjectsTable() {
  return (
    <Table
      aria-label="Projects"
      rows={projects}
      getRowId={(row) => row.key}
      columns={[
        { key: "key", header: "Key", sortable: true, sort: (a, b) => a.key.localeCompare(b.key), width: "6rem" },
        { key: "name", header: "Project", sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
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
      ]}
    />
  );
}
