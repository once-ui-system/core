"use client";

import { Avatar, Column, Row, Table, Text } from "@once-ui-system/core";
import { formatDate, initials, members } from "@/lib/data";
import { StatusTag } from "./StatusTag";

export function MembersTable() {
  return (
    <Table
      aria-label="Members"
      rows={members}
      getRowId={(row) => row.id}
      columns={[
        {
          key: "name",
          header: "Member",
          sortable: true,
          sort: (a, b) => a.name.localeCompare(b.name),
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
        { key: "role", header: "Role", sortable: true, sort: (a, b) => a.role.localeCompare(b.role) },
        { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
        {
          key: "joined",
          header: "Joined",
          hide: { s: true },
          cell: (row) => formatDate(row.joined),
        },
      ]}
    />
  );
}
