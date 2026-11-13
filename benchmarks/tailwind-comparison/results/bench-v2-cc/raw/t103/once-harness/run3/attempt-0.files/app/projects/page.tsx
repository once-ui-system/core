"use client";

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "../../lib/data";

const tone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        rows={projects}
        getRowId={(row) => row.key}
        columns={[
          {
            key: "key",
            header: "Key",
            sortable: true,
            cell: (row) => <Text textVariant="code-strong-s">{row.key}</Text>,
          },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row) => <Tag as="span" tone={tone[row.status]} label={row.status} />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row) => formatDate(row.updated),
          },
        ]}
      />
    </Column>
  );
}
