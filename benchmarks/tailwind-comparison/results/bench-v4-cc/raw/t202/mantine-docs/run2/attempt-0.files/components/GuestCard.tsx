"use client";

import { ActionIcon, Avatar, Badge, Box, Group, Menu, Paper, Text, UnstyledButton } from "@mantine/core";
import { IconArrowsExchange, IconGripVertical, IconUserMinus } from "@tabler/icons-react";
import { RSVP_COLOR, RSVP_LABEL, TABLES, TABLES_BY_ID, initials, partyColor, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";

export function MoveMenu({ guest }: { guest: Guest }) {
  const { placements, seatMap, place, unseat } = usePlan();
  const current = placements[guest.id];
  return (
    <Menu position="bottom-end" shadow="md" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={36} aria-label={`Move or unseat ${guest.name}`}>
          <IconArrowsExchange size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{current ? `Move from ${TABLES_BY_ID[current.table]?.name}` : "Seat at"}</Menu.Label>
        {TABLES.map((t) => {
          const free = (seatMap[t.id] ?? []).filter((s) => s === null).length;
          const here = current?.table === t.id;
          return (
            <Menu.Item
              key={t.id}
              disabled={here || free === 0}
              onClick={() => place(guest.id, t.id)}
              rightSection={
                <Text size="xs" c="dimmed">
                  {here ? "here" : `${free} free`}
                </Text>
              }
            >
              {t.name}
            </Menu.Item>
          );
        })}
        {current && (
          <>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconUserMinus size={16} />} onClick={() => unseat(guest.id)}>
              Unseat
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export function GuestCard({ guest, showSeat }: { guest: Guest; showSeat?: string | null }) {
  const { activeGuest, setActiveGuest, setDragging } = usePlan();
  const active = activeGuest === guest.id;
  return (
    <Paper
      withBorder
      radius="md"
      p={6}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
      }}
      onDragEnd={() => setDragging(null)}
      style={{
        borderColor: active ? "var(--mantine-primary-color-filled)" : undefined,
        boxShadow: active ? "0 0 0 2px var(--mantine-primary-color-light)" : undefined,
      }}
    >
      <Group wrap="nowrap" gap={4}>
        <IconGripVertical size={16} color="var(--mantine-color-dimmed)" aria-hidden style={{ flexShrink: 0 }} />
        <UnstyledButton
          onClick={() => setActiveGuest(active ? null : guest.id)}
          aria-pressed={active}
          aria-label={`${active ? "Deselect" : "Pick up"} ${guest.name}`}
          style={{ flex: 1, minWidth: 0, minHeight: 40 }}
        >
          <Group wrap="nowrap" gap="xs">
            <Avatar size={32} radius="xl" color={partyColor(guest.party)} variant="filled">
              {initials(guest.name)}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {guest.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {showSeat ?? guest.party}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
        <Group gap={4} wrap="nowrap" visibleFrom="xs">
          {guest.diet && (
            <Badge size="sm" variant="light" color="yellow">
              {guest.diet}
            </Badge>
          )}
          {guest.rsvp !== "yes" && (
            <Badge size="sm" variant="light" color={RSVP_COLOR[guest.rsvp]}>
              {RSVP_LABEL[guest.rsvp]}
            </Badge>
          )}
        </Group>
        <MoveMenu guest={guest} />
      </Group>
    </Paper>
  );
}
