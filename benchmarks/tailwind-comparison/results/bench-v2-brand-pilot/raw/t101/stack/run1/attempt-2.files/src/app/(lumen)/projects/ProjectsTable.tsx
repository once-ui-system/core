"use client";

import { Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsTable() {
  return (
    <Table
      compact
      searchable
      searchPlaceholder="Search projects"
      data={{
        headers: [
          { content: "Key", key: "key", sortable: true, width: "12%" },
          { content: "Project", key: "name", sortable: true },
          { content: "Status", key: "status", sortable: true, width: "16%" },
          { content: "Issues", key: "issues", sortable: true, width: "12%", align: "right" },
          { content: "Updated", key: "updated", sortable: true, width: "18%", hide: { s: true } },
        ],
        rows: projects.map((p) => [
          <Text key="k" variant="code-default-s">
            {p.key}
          </Text>,
          <Text key="n" variant="body-strong-s">
            {p.name}
          </Text>,
          <Row key="s">
            <Tag size="s" scheme={scheme[p.status]}>
              {p.status}
            </Tag>
          </Row>,
          <Text key="i" variant="body-default-s" className="lumen-figures">
            {p.issues}
          </Text>,
          <Text key="u" variant="body-default-s" className="lumen-figures">
            {formatDate(p.updated)}
          </Text>,
        ]),
      }}
    />
  );
}
