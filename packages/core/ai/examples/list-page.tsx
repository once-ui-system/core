"use client";

/**
 * Gold example: list page
 * Target: a page of records — title with the one primary action, a status
 * filter, a searchable, sortable, paginated Table with status tags and row
 * actions, and an empty state that offers a way back.
 *
 * Table searches and sorts by the text inside each cell, so a cell that is a
 * component (the name with its email, the status Tag) should carry its text as
 * children, not only in a prop.
 */
import {
  Button,
  Column,
  Heading,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type Status = "active" | "invited" | "suspended";

type Member = {
  name: string;
  email: string;
  role: string;
  status: Status;
  lastActive: string;
};

const members: Member[] = [
  {
    name: "Ada Park",
    email: "ada@acme.dev",
    role: "Owner",
    status: "active",
    lastActive: "2026-10-09",
  },
  {
    name: "Bruno Silva",
    email: "bruno@acme.dev",
    role: "Admin",
    status: "active",
    lastActive: "2026-10-08",
  },
  { name: "Chen Wei", email: "chen@acme.dev", role: "Editor", status: "invited", lastActive: "—" },
  {
    name: "Dara Okafor",
    email: "dara@acme.dev",
    role: "Viewer",
    status: "suspended",
    lastActive: "2026-08-21",
  },
];

// The scheme colours the tag and the text says the same thing, so status is
// never carried by colour alone.
const statusTag: Record<Status, { scheme: "success" | "warning" | "danger"; label: string }> = {
  active: { scheme: "success", label: "Active" },
  invited: { scheme: "warning", label: "Invited" },
  suspended: { scheme: "danger", label: "Suspended" },
};

type Filter = "all" | Status;

export function ListPageExample({
  onInvite,
  onEdit,
  onRemove,
}: {
  onInvite?: () => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = members.filter((member) => filter === "all" || member.status === filter);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start" }}
        >
          <Column gap="8">
            <Heading as="h1" textVariant="display-strong-xs">
              Members
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Everyone with access to this workspace.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={onInvite}>
            Invite member
          </Button>
        </Row>

        <SegmentedControl
          fillWidth={false}
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          buttons={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "invited", label: "Invited" },
            { value: "suspended", label: "Suspended" },
          ]}
        />

        <Table
          searchable
          searchPlaceholder="Search members"
          paginated
          defaultPageSize={10}
          data={{
            headers: [
              { content: "Name", key: "name", sortable: true },
              { content: "Role", key: "role", sortable: true },
              { content: "Status", key: "status", sortable: true },
              { content: "Last active", key: "lastActive", sortable: true, align: "right" },
            ],
            rows: visible.map((member) => [
              <Column key="name" gap="4">
                <Text textVariant="label-default-s">{member.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {member.email}
                </Text>
              </Column>,
              member.role,
              <Tag key="status" size="s" tone={statusTag[member.status].scheme}>
                {statusTag[member.status].label}
              </Tag>,
              member.lastActive,
            ]),
          }}
          actions={[
            {
              icon: "edit",
              tooltip: "Edit member",
              onClick: (row) => onEdit?.(visible[row]),
            },
            {
              icon: "trash",
              tooltip: "Remove member",
              variant: "primary",
              tone: "danger",
              onClick: (row) => onRemove?.(visible[row]),
            },
          ]}
          emptyState={
            <Column center gap="12" padding="32">
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                No members match this filter.
              </Text>
              <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
                Show everyone
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
