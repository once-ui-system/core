"use client";

import { Avatar, Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, members } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme = { Active: "success", Invited: "info", Suspended: "danger" } as const;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function MembersView() {
  const { openInvite } = useLumen();

  return (
    <>
      <PageHeader
        title="Members"
        description="People with access to your Lumen workspace."
        actions={<Button size="s" prefixIcon="mail" label="Invite member" onClick={openInvite} />}
      />

      <Column
        as="ul"
        fillWidth
        gap="12"
        margin="0"
        padding="0"
        style={{ listStyle: "none" }}
        aria-label="Members"
      >
        {members.map((m) => (
          <Row
            as="li"
            key={m.id}
            background="page"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            horizontal="between"
            wrap
          >
            <Row gap="12" vertical="center" flex={1} minWidth={12}>
              <Avatar size="m" value={initials(m.name)} />
              <Column gap="2" minWidth={0}>
                <Text variant="label-strong-m">{m.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {m.email}
                </Text>
              </Column>
            </Row>
            <Row gap="12" vertical="center" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {m.role}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {m.joined ? `Joined ${formatDate(m.joined)}` : "Not joined yet"}
              </Text>
              <Tag scheme={statusScheme[m.status]} label={m.status} />
            </Row>
          </Row>
        ))}
      </Column>
    </>
  );
}
