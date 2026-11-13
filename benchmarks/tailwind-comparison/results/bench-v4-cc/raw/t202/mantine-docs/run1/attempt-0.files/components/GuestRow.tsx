"use client";

import { ActionIcon, Avatar, Badge, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconDots, IconUserMinus } from "@tabler/icons-react";
import { RSVP_LABEL, TABLES, TABLE_BY_ID, dietColor, initials, partyColor, type Guest } from "@/lib/data";
import { freeSeats } from "@/lib/seating";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

export function GuestRow({ guest, seatLabel }: { guest: Guest; seatLabel?: string }) {
  const { index, seats, held, hold, setDragging, seatGuest, unseat, flaggedGuests } = usePlan();
  const place = index[guest.id];
  const isHeld = held === guest.id;
  const flagged = flaggedGuests.has(guest.id);

  return (
    <div
      className={css.guestRow}
      data-held={isHeld ? "true" : undefined}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
      }}
      onDragEnd={() => setDragging(null)}
    >
      <UnstyledButton
        className={css.guestMain}
        onClick={() => hold(isHeld ? null : guest.id)}
        aria-pressed={isHeld}
        aria-label={`${guest.name}${isHeld ? ", picked up. Tap a seat to place" : place ? ". Pick up to move" : ". Pick up to seat"}`}
      >
        <Avatar color={partyColor(guest.party)} variant="light" radius="xl" size={34}>
          {initials(guest.name)}
        </Avatar>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {guest.name}
            </Text>
            {flagged && (
              <Badge size="xs" color="red" variant="light">
                Rule
              </Badge>
            )}
          </Group>
          <Group gap={6} wrap="wrap">
            <Text size="xs" c="dimmed">
              {seatLabel ? `${seatLabel} · ` : ""}
              {guest.party}
            </Text>
            {guest.rsvp !== "yes" && (
              <Badge size="xs" color="gray" variant="outline">
                {RSVP_LABEL[guest.rsvp]}
              </Badge>
            )}
            {guest.diet && (
              <Badge size="xs" color={dietColor(guest.diet)} variant="light">
                {guest.diet}
              </Badge>
            )}
          </Group>
        </div>
      </UnstyledButton>
      <Menu position="bottom-end" shadow="md" width={240}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" size="lg" aria-label={`Seat, move or unseat ${guest.name}`}>
            <IconDots size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{place ? "Move to" : "Seat at"}</Menu.Label>
          {TABLES.map((t) => {
            const free = freeSeats(seats, t.id);
            const here = place?.table === t.id;
            return (
              <Menu.Item
                key={t.id}
                disabled={here || free === 0}
                rightSection={
                  <Text size="xs" c="dimmed">
                    {here ? "here" : free === 0 ? "full" : `${free} free`}
                  </Text>
                }
                onClick={() => seatGuest(guest.id, t.id)}
              >
                {TABLE_BY_ID[t.id].name}
              </Menu.Item>
            );
          })}
          {place && (
            <>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconUserMinus size={16} />} onClick={() => unseat(guest.id)}>
                Unseat
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
