"use client";

import { Avatar, Column, Row, Table, Text } from "@once-ui-system/core";
import type { TableColumn } from "@once-ui-system/core";
import { formatDate, initials, members, type Member } from "@/lib/data";
import { StatusTag } from "./StatusTag";

const columns: TableColumn<Member>[] = [
  {
    key: "name",
    header: "Member",
    sortable: true,
    cell: (row) => (
      <Row gap="12" vertical="center">
        <Avatar size="s" value={initials(row.name)} />
        <Column>
          <Text textVariant="label-strong-s">{row.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {row.email}
          </Text>
        </Column>
      </Row>
    ),
  },
  { key: "role", header: "Role", sortable: true },
  { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
  {
    key: "joined",
    header: "Joined",
    hide: { s: true },
    cell: (row) => formatDate(row.joined),
  },
];

export function MembersTable() {
  return (
    <Table<Member>
      aria-label="Members"
      columns={columns}
      rows={members}
      getRowId={(row) => row.id}
    />
  );
}
