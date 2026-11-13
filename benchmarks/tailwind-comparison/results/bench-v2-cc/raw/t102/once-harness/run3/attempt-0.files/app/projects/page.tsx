"use client";

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type Project } from "@/lib/data";

const tone = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Everything your team is building, in one place.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={[
          { key: "key", header: "Key", sortable: true, width: "8rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            cell: (row) => <Tag tone={tone[row.status]} label={row.status} dot />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row) => formatDate(row.updated),
          },
        ]}
        rows={projects}
        getRowId={(row) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
      />
    </Column>
  );
}
