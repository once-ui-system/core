"use client"

import { Badge, Box, Button, Flex, IconButton, Menu, Portal, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuChevronDown, LuEllipsis, LuGrip } from "react-icons/lu"
import {
  GUESTS_BY_ID,
  RSVP_LABEL,
  RSVP_PALETTE,
  TABLES,
  initials,
  partyColor,
} from "@/lib/data"
import { usePlan } from "./store"

export function GuestAvatar({ guestId, size = "9" }: { guestId: string; size?: string }) {
  const g = GUESTS_BY_ID[guestId]
  return (
    <Flex
      aria-hidden
      flexShrink={0}
      boxSize={size}
      rounded="full"
      align="center"
      justify="center"
      bg={`${partyColor(g.party)}.700`}
      color="white"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.02em"
    >
      {initials(g.name)}
    </Flex>
  )
}

export function DietTag({ diet }: { diet: string }) {
  return (
    <Badge colorPalette="orange" variant="subtle" size="sm" rounded="full">
      {diet}
    </Badge>
  )
}

export function RsvpBadge({ guestId }: { guestId: string }) {
  const g = GUESTS_BY_ID[guestId]
  return (
    <Badge colorPalette={RSVP_PALETTE[g.rsvp]} variant="subtle" size="sm">
      {RSVP_LABEL[g.rsvp]}
    </Badge>
  )
}

/** Menu with every table (and Unseat) so a guest can be placed or moved without dragging. */
export function SeatMenu({
  guestId,
  label,
  iconOnly,
}: {
  guestId: string
  label: string
  iconOnly?: boolean
}) {
  const { seats, tableOf, place, unseat } = usePlan()
  const g = GUESTS_BY_ID[guestId]
  const current = tableOf[guestId]
  return (
    <Menu.Root
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => {
        if (d.value === "__unseat") unseat(guestId)
        else place(guestId, d.value)
      }}
    >
      <Menu.Trigger asChild>
        {iconOnly ? (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`${label}: ${g.name}`}
          >
            <LuEllipsis />
          </IconButton>
        ) : (
          <Button variant="outline" size="xs" aria-label={`${label}: ${g.name}`}>
            {label}
            <LuChevronDown />
          </Button>
        )}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="13rem">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Seat {g.name.split(" ")[0]} at</Menu.ItemGroupLabel>
              {TABLES.map((t) => {
                const free = seats[t.id].filter((x) => x === null).length
                const isCurrent = current === t.id
                return (
                  <Menu.Item
                    key={t.id}
                    value={t.id}
                    disabled={isCurrent || free === 0}
                  >
                    <Text flex="1">{t.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {isCurrent ? "current" : free === 0 ? "full" : `${free} free`}
                    </Text>
                  </Menu.Item>
                )
              })}
            </Menu.ItemGroup>
            {current && (
              <>
                <Menu.Separator />
                <Menu.Item value="__unseat" color="fg.error">
                  Unseat
                </Menu.Item>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

/** A guest row: the name area picks the guest up (tap) or drags them; the menu is the keyboard route. */
export function GuestRow({
  guestId,
  menuLabel,
  showRsvp,
  trailing,
}: {
  guestId: string
  menuLabel: string
  showRsvp?: boolean
  trailing?: React.ReactNode
}) {
  const { picked, pick, startDrag, wasDragged, dragGuest } = usePlan()
  const g = GUESTS_BY_ID[guestId]
  const isPicked = picked === guestId
  return (
    <Flex
      align="center"
      gap="1"
      rounded="lg"
      borderWidth="1px"
      borderColor={isPicked ? "brand.solid" : "border"}
      bg={isPicked ? "brand.subtle" : "bg.panel"}
      opacity={dragGuest === guestId ? 0.5 : 1}
      pe="1.5"
    >
      <chakra.button
        type="button"
        flex="1"
        minW="0"
        display="flex"
        alignItems="center"
        gap="3"
        px="2.5"
        py="2"
        textAlign="start"
        cursor="grab"
        rounded="lg"
        aria-pressed={isPicked}
        onPointerDown={(e: React.PointerEvent) => startDrag(guestId, e)}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onClick={() => {
          if (wasDragged()) return
          pick(isPicked ? null : guestId)
        }}
        style={{ userSelect: "none", WebkitTouchCallout: "none" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "1px" }}
      >
        <LuGrip aria-hidden style={{ opacity: 0.4, flexShrink: 0 }} />
        <GuestAvatar guestId={guestId} size="8" />
        <Box minW="0" flex="1">
          <Text fontSize="sm" fontWeight="semibold" truncate>
            {g.name}
          </Text>
          <Flex gap="1.5" align="center" wrap="wrap">
            <Text fontSize="xs" color="fg.muted" truncate>
              {g.party}
            </Text>
            {g.diet && <DietTag diet={g.diet} />}
            {showRsvp && <RsvpBadge guestId={guestId} />}
          </Flex>
        </Box>
      </chakra.button>
      {trailing}
      <SeatMenu guestId={guestId} label={menuLabel} />
    </Flex>
  )
}
