"use client"

import { Badge, Box, Flex, HStack, IconButton, Span, Stack, Text, chakra } from "@chakra-ui/react"
import { MdDragIndicator, MdMoreVert } from "react-icons/md"
import { Avatar } from "@/components/ui/avatar"
import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { tables, type Guest } from "@/lib/data"
import { filledCount, partyPalette, RSVP_LABEL, RSVP_PALETTE } from "@/lib/plan"
import { usePlan } from "@/lib/store"

export function DietTag({ diet }: { diet: string }) {
  return (
    <Badge colorPalette="yellow" variant="subtle" size="sm" whiteSpace="nowrap">
      {diet}
    </Badge>
  )
}

function MoveMenu({ guest, currentTableId }: { guest: Guest; currentTableId: string | null }) {
  const plan = usePlan()
  const seated = currentTableId !== null
  return (
    <MenuRoot
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => {
        if (d.value === "__unseat") plan.unseat(guest.id)
        else plan.place(guest.id, d.value)
      }}
    >
      <MenuTrigger asChild>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={`${seated ? "Move or unseat" : "Seat"} ${guest.name}`}
          _focusVisible={{ outlineColor: "brand.focusRing" }}
        >
          <MdMoreVert />
        </IconButton>
      </MenuTrigger>
      <MenuContent minW="13rem">
        <MenuItemGroup title={seated ? "Move to" : "Seat at"}>
          {tables.map((t) => {
            const free = t.seats - filledCount(plan.seats[t.id])
            const here = t.id === currentTableId
            return (
              <MenuItem key={t.id} value={t.id} disabled={here || free === 0}>
                {t.name}
                <Span ms="auto" color="fg.muted" fontSize="xs">
                  {here ? "current" : free === 0 ? "full" : `${free} free`}
                </Span>
              </MenuItem>
            )
          })}
        </MenuItemGroup>
        {seated ? (
          <>
            <MenuSeparator />
            <MenuItem value="__unseat" color="fg.error" _hover={{ bg: "bg.error" }}>
              Unseat
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </MenuRoot>
  )
}

export function GuestRow({
  guest,
  seatLabel,
  showParty = true,
}: {
  guest: Guest
  seatLabel?: string
  showParty?: boolean
}) {
  const plan = usePlan()
  const pos = plan.positions[guest.id]
  const armed = plan.armedGuestId === guest.id
  const focused = plan.focusGuestId === guest.id
  const flagged = plan.flaggedGuests.has(guest.id)
  const palette = partyPalette(guest.party)
  const sub = [showParty ? guest.party : null, seatLabel ?? null].filter(Boolean).join(" · ")

  return (
    <Flex
      align="center"
      gap="1"
      borderWidth="1px"
      borderColor={armed ? "brand.solid" : flagged ? "red.emphasized" : focused ? "brand.emphasized" : "border"}
      bg={armed ? "brand.subtle" : focused ? "brand.subtle" : "bg.panel"}
      borderRadius="lg"
      ps="1"
      pe="1"
      transition="background 120ms, border-color 120ms"
    >
      <Box color="fg.subtle" display={{ base: "none", md: "block" }} aria-hidden="true" ps="1">
        <MdDragIndicator />
      </Box>
      <Box aria-hidden="true" ps="1" pe="1">
        <Avatar name={guest.name} size="sm" colorPalette={palette} />
      </Box>
      <chakra.button
        type="button"
        flex="1"
        minW="0"
        display="flex"
        alignItems="center"
        gap="2.5"
        textAlign="start"
        py="2"
        borderRadius="md"
        cursor="grab"
        draggable
        aria-pressed={armed}
        _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "1px" }}
        onClick={() => plan.armGuest(armed ? null : guest.id)}
        onDragStart={(e: React.DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id)
          e.dataTransfer.effectAllowed = "move"
          plan.setDragGuest(guest.id)
        }}
        onDragEnd={() => plan.setDragGuest(null)}
      >
        <Stack as="span" gap="0.5" minW="0" flex="1">
          <Text as="span" display="block" fontWeight="medium" fontSize="sm" truncate>
            {guest.name}
          </Text>
          <HStack as="span" gap="1.5" wrap="wrap">
            {sub ? (
              <Text as="span" fontSize="xs" color="fg.muted" truncate>
                {sub}
              </Text>
            ) : null}
            {guest.rsvp !== "yes" ? (
              <Badge size="xs" colorPalette={RSVP_PALETTE[guest.rsvp]} variant="subtle">
                {RSVP_LABEL[guest.rsvp]}
              </Badge>
            ) : null}
            {guest.diet ? <DietTag diet={guest.diet} /> : null}
            {flagged ? (
              <Badge size="xs" colorPalette="red" variant="solid">
                Rule broken
              </Badge>
            ) : null}
          </HStack>
        </Stack>
      </chakra.button>
      <MoveMenu guest={guest} currentTableId={pos?.tableId ?? null} />
    </Flex>
  )
}
