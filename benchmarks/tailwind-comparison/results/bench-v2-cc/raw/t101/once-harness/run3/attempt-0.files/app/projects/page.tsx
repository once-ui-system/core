"use client";

import { Column, Heading, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "../../lib/data";

const tone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  return (
    <Column gap="16">
      <Row horizontal="between" vertical="end" gap="12" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="heading-strong-xl">
            Projects
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {projects.length} projects in this workspace
          </Text>
        </Column>
      </Row>
      <Table
        compact
        aria-label="Projects"
        rows={projects}
        getRowId={(row: Project) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
        columns={[
          { key: "key", header: "Key", sortable: true, width: "6rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row: Project) => <Tag as="span" size="s" tone={tone[row.status]} label={row.status} />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
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
