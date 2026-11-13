"use client";

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { type Project, projects, statusTone } from "../../lib/data";

export default function ProjectsPage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Projects
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
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
            cell: (row) => <Tag tone={statusTone[row.status]} label={row.status} size="s" />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          { key: "updated", header: "Updated", sortable: true },
        ]}
      />
    </Column>
  );
}
