"use client";

import { Badge, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { RSVP_LABEL, initials, type Guest } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan } from "@/lib/plan";
import { partyStyle } from "@/lib/style";

export function GuestChip({ guest }: { guest: Guest }) {
  const { selectedGuest, selectGuest } = usePlan();
  const { begin, justDragged, dragging } = useDrag();
  const selected = selectedGuest === guest.id;
  const p = partyStyle(guest.party);
  const unconfirmed = guest.rsvp !== "yes";

  return (
    <UnstyledButton
      onPointerDown={(e) => begin(e, guest.id)}
      onClick={() => {
        if (justDragged()) return;
        selectGuest(selected ? null : guest.id);
      }}
      aria-pressed={selected}
      px="xs"
      py={6}
      bg="white"
      style={{
        border: `1.5px solid ${selected ? "var(--mantine-color-brand-8)" : "var(--mantine-color-gray-3)"}`,
        boxShadow: selected ? "0 0 0 3px var(--mantine-color-brand-1)" : "var(--mantine-shadow-xs)",
        borderRadius: 999,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        cursor: dragging === guest.id ? "grabbing" : "grab",
        opacity: dragging === guest.id ? 0.45 : 1,
        minHeight: 44,
      }}
    >
      <Group gap={8} wrap="nowrap">
        <Box
          aria-hidden
          w={30}
          h={30}
          style={{
            flex: "none",
            borderRadius: "50%",
            background: p.bg,
            color: p.fg,
            border: `1.5px solid ${p.edge}`,
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {initials(guest.name)}
        </Box>
        <Box>
          <Text size="sm" fw={600} lh={1.2} style={{ whiteSpace: "nowrap" }}>
            {guest.name}
          </Text>
          <Text size="xs" c="gray.7" lh={1.2} style={{ whiteSpace: "nowrap" }}>
            {guest.party}
          </Text>
        </Box>
        {guest.diet ? (
          <Badge size="sm" variant="light" color="orange" c="gray.9" style={{ flex: "none" }}>
            {guest.diet}
          </Badge>
        ) : null}
        {unconfirmed ? (
          <Badge size="sm" variant="outline" color="gray.7" style={{ flex: "none" }}>
            {RSVP_LABEL[guest.rsvp]}
          </Badge>
        ) : null}
      </Group>
    </UnstyledButton>
  );
}
