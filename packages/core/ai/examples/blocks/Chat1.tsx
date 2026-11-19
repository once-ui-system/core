"use client";

import { Avatar, Column, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import type { ChatMember } from "./content/chat1content";
import { chatMembers } from "./content/chat1content";
import { Feed3 } from "./Feed3";
import { Sidebar4 } from "./Sidebar4";
import { Sidebar5 } from "./Sidebar5";
import { Table1 } from "./Table1";

type MemberRow = ChatMember["members"][number] & { group: string };

export const Chat1 = () => {
  const [activeItem, setActiveItem] = useState<string | undefined>(undefined);

  const membersData = chatMembers.flatMap((section) =>
    (section.members ?? []).map((m) => ({
      ...m,
      group: section.title,
    })),
  );

  const membersColumns = [
    {
      key: "member",
      title: <Text textVariant="label-default-s">Member</Text>,
      render: (item: MemberRow) => (
        <Row fillWidth gap="12" vertical="center">
          <Avatar src={item.avatar || undefined} />
          <Column fillWidth>
            <Text textVariant="label-default-s">{item.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
              {item.status}
            </Text>
          </Column>
        </Row>
      ),
    },
    {
      key: "group",
      title: <Text textVariant="label-default-s">Role</Text>,
      render: (item: MemberRow) => (
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {item.group}
        </Text>
      ),
    },
    {
      key: "status",
      title: <Text textVariant="label-default-s">Bio</Text>,
      render: (item: MemberRow) => (
        <Text textVariant="label-default-s" onBackground="neutral-weak" truncate>
          {item.bio || "—"}
        </Text>
      ),
    },
  ];

  return (
    <Row fill>
      <Sidebar4 activeItem={activeItem} onSelectItem={setActiveItem} />
      {activeItem === "Members" ? (
        <Row fillWidth padding="24">
          <Table1
            fitHeight
            background="surface"
            data={membersData}
            columns={membersColumns}
            selectable
            getId={(i: MemberRow) => i.name}
            heading={<Text textVariant="label-default-m">Members</Text>}
            showSearch
            filterFn={(item: MemberRow, q: string) =>
              [item.name, item.status, item.bio, item.group]
                .filter(Boolean)
                .some((v: string) => v.toLowerCase().includes(q))
            }
          />
        </Row>
      ) : (
        <Feed3 />
      )}
      <Sidebar5 />
    </Row>
  );
};
