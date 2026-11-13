"use client";

import { Button, Column, SegmentedControl, Table, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { formatDate, projects, type Project, type ProjectStatus } from "../lib/data";

type Filter = "all" | ProjectStatus;

// Colour and text say the same thing, so status is never carried by colour alone.
const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible: Project[] = projects.filter((p) => filter === "all" || p.status === filter);

  return (
    <Column gap="12">
      <SegmentedControl
        fillWidth={false}
        compact
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table
        aria-label="Projects"
        compact
        searchable
        searchPlaceholder="Search projects"
        emptyState={
          <Column center gap="12" padding="24">
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No projects match this filter.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
        columns={[
          { header: "Key", key: "key", sortable: true, width: "6rem" },
          { header: "Project", key: "name", sortable: true },
          { header: "Status", key: "status", sortable: true },
          { header: "Open issues", key: "issues", sortable: true, align: "right" },
          { header: "Updated", key: "updated", sortable: true, align: "right" },
        ]}
        rows={visible.map((project) => [
          <Text key="key" textVariant="label-strong-s" onBackground="brand-strong">
            {project.key}
          </Text>,
          project.name,
          <Tag key="status" size="s" tone={statusTone[project.status]}>
            {project.status}
          </Tag>,
          String(project.issues),
          formatDate(project.updated),
        ])}
      />
    </Column>
  );
}
