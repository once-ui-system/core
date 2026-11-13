"use client";

import {
  Button,
  Column,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
  type Tone,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { type Project, type ProjectStatus, projects } from "../../lib/data";

// Status is spelled out in the tag text, so colour never carries it alone.
const statusTone: Record<ProjectStatus, Tone> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

type Filter = "all" | ProjectStatus;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = projects.filter((project) => filter === "all" || project.status === filter);

  return (
    <Column gap="32">
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="16"
        s={{ direction: "column", horizontal: "start", vertical: "start" }}
      >
        <PageHeader
          eyebrow="Workspace"
          title="Projects"
          description="Everything your team is building, and how many issues are open."
        />
        <Button prefixIcon="plus" label="New project" />
      </Row>

      <SegmentedControl
        fillWidth={false}
        aria-label="Filter projects by status"
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table<Project>
        aria-label="Projects"
        searchable
        searchPlaceholder="Search projects"
        getRowId={(row) => row.key}
        rows={visible}
        columns={[
          {
            key: "name",
            header: "Project",
            sortable: true,
            sort: (a, b) => a.name.localeCompare(b.name),
            cell: (row) => (
              <Column gap="4">
                <Text textVariant="label-strong-m">{row.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {row.key}
                </Text>
              </Column>
            ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            sort: (a, b) => a.status.localeCompare(b.status),
            cell: (row) => (
              <Tag size="s" tone={statusTone[row.status]}>
                {row.status}
              </Tag>
            ),
          },
          {
            key: "issues",
            header: "Open issues",
            sortable: true,
            align: "right",
            sort: (a, b) => a.issues - b.issues,
            cell: (row) => String(row.issues),
          },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            align: "right",
            sort: (a, b) => a.updated.localeCompare(b.updated),
            cell: (row) => formatDate(row.updated),
          },
        ]}
        emptyState={
          <Column center gap="12" padding="32">
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              No projects match this filter yet.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
      />
    </Column>
  );
}
