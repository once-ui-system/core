"use client";

import { Column, Table, Tag } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

export default function ProjectsPage() {
  const active = projects.filter((project) => project.status === "Active").length;

  return (
    <Column fillWidth gap="16">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects, ${active} active.`}
      />
      <Table
        aria-label="Projects"
        rows={projects}
        compact
        searchable
        searchPlaceholder="Search projects"
        getRowId={(row: Project) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
        columns={[
          { key: "key", header: "Key", sortable: true, width: "6rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row: Project) => <Tag tone={statusTone[row.status]} label={row.status} size="s" />,
          },
          { key: "issues", header: "Issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row: Project) => formatDate(row.updated),
          },
        ]}
      />
    </Column>
  );
}
