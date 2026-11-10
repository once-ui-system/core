"use client";

import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuGripVertical } from "react-icons/lu";
import { usePlan } from "@/components/plan-provider";
import { partyPalette, rsvpLabel, type Guest } from "@/lib/data";

export function GuestChip({ guest, showTable }: { guest: Guest; showTable?: string }) {
  const { selectedGuestId, selectGuest, beginPress, consumeClick, brokenGuests } = usePlan();
  const selected = selectedGuestId === guest.id;
  const pal = partyPalette[guest.party] ?? "gray";
  const flagged = brokenGuests.has(guest.id);

  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${guest.rsvp !== "yes" ? `, ${rsvpLabel[guest.rsvp]}` : ""}. Press to select, then choose a table.`}
      align="center"
      gap="2.5"
      pl="1"
      pr="3"
      py="2"
      rounded="lg"
      borderWidth="1px"
      borderColor={selected ? "fg" : flagged ? "red.solid" : "border.muted"}
      bg={selected ? "bg.muted" : "bg.panel"}
      cursor="grab"
      userSelect="none"
      onPointerDown={(e) => beginPress(e, guest.id)}
      onClick={() => {
        if (consumeClick()) return;
        selectGuest(selected ? null : guest.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectGuest(selected ? null : guest.id);
        }
      }}
      _hover={{ borderColor: "border.emphasized" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "1px" }}
    >
      <Box
        aria-hidden
        color="fg.subtle"
        px="1"
        py="2"
        style={{ touchAction: "none" }}
        display="flex"
        alignItems="center"
      >
        <LuGripVertical />
      </Box>
      <Box boxSize="2.5" rounded="full" flexShrink={0} bg={`${pal}.solid`} aria-hidden />
      <Box flex="1" minW="0">
        <Text fontSize="sm" fontWeight="semibold" truncate>
          {guest.name}
        </Text>
        <Text fontSize="xs" color="fg.muted" truncate>
          {guest.party}
          {showTable ? ` · ${showTable}` : ""}
        </Text>
      </Box>
      <HStack gap="1" flexShrink={0}>
        {guest.rsvp !== "yes" ? (
          <Badge size="xs" colorPalette={guest.rsvp === "maybe" ? "orange" : "gray"} variant="subtle">
            {rsvpLabel[guest.rsvp]}
          </Badge>
        ) : null}
        {guest.diet ? (
          <Badge size="xs" colorPalette="yellow" variant="subtle">
            {guest.diet}
          </Badge>
        ) : null}
      </HStack>
    </Flex>
  );
}
