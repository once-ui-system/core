"use client";

import type { ReactNode } from "react";
import { Avatar, Column, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { Guest } from "@/lib/data";
import { initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export function GuestChip({
  guest,
  active,
  onClick,
  hint,
  trailing,
}: {
  guest: Guest;
  active: boolean;
  onClick: () => void;
  hint?: string;
  trailing?: ReactNode;
}) {
  const { setDragId } = usePlan();
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      style={{ width: "100%", display: "flex", gap: 4, alignItems: "stretch" }}>
      <Row
        as="button"
        type="button"
        flex={1}
        aria-pressed={active}
        aria-label={`${guest.name}${guest.diet ? `, ${guest.diet}` : ""}. ${hint ?? "Pick up to place"}`}
        onClick={onClick}
        gap="12"
        padding="8"
        radius="m"
        vertical="center"
        cursor="interactive"
        background={active ? "brand-alpha-weak" : "neutral-alpha-weak"}
        border={active ? "brand-alpha-strong" : "transparent"}>
        <Icon name="grip" size="xs" onBackground="neutral-weak" />
        <Avatar size="s" value={initials(guest.name)} />
        <Column flex={1} gap="2" horizontal="start">
          <Text textVariant="label-strong-s">{guest.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {guest.party}
          </Text>
        </Column>
        {guest.diet ? <Tag tone="accent" size="s" label={guest.diet} /> : null}
      </Row>
      {trailing}
    </div>
  );
}
