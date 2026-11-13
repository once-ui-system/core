"use client";

import { Column, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone } from "../lib/data";

export function ProjectsTable() {
  return (
    <Column fillWidth overflowX="auto">
      <Table
        aria-label="Projects"
        rows={projects}
        getRowId={(row) => row.key}
        columns={[
          {
            key: "key",
            header: "Key",
            sortable: true,
            cell: (row) => <Text textVariant="label-strong-s">{row.key}</Text>,
          },
          { key: "name", header: "Name", sortable: true, cell: (row) => <Text>{row.name}</Text> },
          {
            key: "status",
            header: "Status",
            cell: (row) => <Tag tone={statusTone(row.status)} label={row.status} />,
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
            cell: (row) => <Text>{formatDate(row.updated)}</Text>,
          },
        ]}
      />
    </Column>
  );
}
