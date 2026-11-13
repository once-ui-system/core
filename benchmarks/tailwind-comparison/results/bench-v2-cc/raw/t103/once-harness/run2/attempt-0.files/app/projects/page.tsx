"use client";

import { Column, Row, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    cell: (row) => (
      <Text textVariant="code-strong-s" onBackground="brand-medium">
        {row.key}
      </Text>
    ),
  },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag label={row.status} tone={statusTone[row.status]} size="s" />,
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
    <Column fillWidth gap="24">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />
      <Row fillWidth overflowX="auto">
        <Column fillWidth minWidth="36rem">
          <Table
            aria-label="Projects"
            columns={columns}
            rows={projects}
            getRowId={(row) => row.key}
            searchable
            searchPlaceholder="Search projects"
          />
        </Column>
      </Row>
    </Column>
  );
}
