"use client";

import { Avatar, Badge, Box, Group, Paper, Text } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import type { DragEvent, KeyboardEvent } from "react";
import { DIET_COLOR, PARTY_COLOR, initials, type Guest } from "@/lib/data";
import { cx } from "@/lib/cx";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

/** An unseated guest: tap to pick up, then tap a seat or table; or drag onto the plan. */
export function GuestChip({ guest }: { guest: Guest }) {
  const { armedGuestId, arm, setDragId } = usePlan();
  const armed = armedGuestId === guest.id;
  const toggle = () => arm(armed ? null : guest.id);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", guest.id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(guest.id);
  };

  return (
    <Paper
      withBorder
      p="xs"
      role="button"
      tabIndex={0}
      aria-pressed={armed}
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => setDragId(null)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cx(classes.chip, armed && classes.chipArmed)}
    >
      <Group wrap="nowrap" gap="xs">
        <Avatar size={32} radius="xl" color={PARTY_COLOR[guest.party] ?? "gray"} variant="filled" fz={12} fw={700}>
          {initials(guest.name)}
        </Avatar>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fz="sm" fw={600} truncate lh={1.25}>
            {guest.name}
          </Text>
          <Text fz="xs" c="gray.7" truncate lh={1.25}>
            {guest.party}
          </Text>
        </Box>
        {guest.diet ? (
          <Badge size="sm" variant="light" color={DIET_COLOR[guest.diet] ?? "gray"}>
            {guest.diet}
          </Badge>
        ) : null}
        <IconGripVertical size={16} color="var(--mantine-color-gray-5)" aria-hidden />
      </Group>
    </Paper>
  );
}
