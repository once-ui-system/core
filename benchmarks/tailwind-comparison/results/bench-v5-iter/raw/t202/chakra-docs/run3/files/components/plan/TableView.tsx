"use client"

import { Box, Stack, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { MdWarning } from "react-icons/md"
import { Tooltip } from "@/components/ui/tooltip"
import type { TableDef } from "@/lib/data"
import {
  filledCount,
  guestById,
  initials,
  partyPalette,
  tableGeometry,
} from "@/lib/plan"
import { usePlan } from "@/lib/store"

const pct = (m: number, total: number) => `${(m / total) * 100}%`

export function TableView({
  table,
  overTableId,
  setOverTableId,
}: {
  table: TableDef
  overTableId: string | null
  setOverTableId: (id: string | null) => void
}) {
  const plan = usePlan()
  const g = tableGeometry(table)
  const row = plan.seats[table.id] ?? []
  const filled = filledCount(row)
  const full = filled >= table.seats
  const selected = plan.selectedTableId === table.id
  const flagged = plan.flaggedTables[table.id] ?? 0
  const dragging = plan.dragGuestId !== null
  const armed = plan.armedGuestId !== null
  const over = overTableId === table.id
  const hasRoom = !full
  const hint = (dragging || armed) && hasRoom
  const round = table.shape === "round"

  const status = [
    `${filled} of ${table.seats} seats filled`,
    flagged > 0 ? `${flagged} broken ${flagged === 1 ? "rule" : "rules"}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  const onDragOver = (e: React.DragEvent) => {
    if (!plan.dragGuestId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (overTableId !== table.id) setOverTableId(table.id)
  }
  const onDrop = (e: React.DragEvent, seat?: number) => {
    e.preventDefault()
    const gid = plan.dragGuestId ?? e.dataTransfer.getData("text/plain")
    plan.setDragGuest(null)
    setOverTableId(null)
    if (gid) plan.place(gid, table.id, seat)
  }

  const borderColor = flagged > 0 ? "red.solid" : selected ? "brand.solid" : over ? "brand.solid" : hint ? "brand.emphasized" : "border.emphasized"

  return (
    <Box
      position="absolute"
      left={pct(g.left, 24)}
      top={pct(g.top, 14)}
      w={pct(g.w, 24)}
      h={pct(g.h, 14)}
      pointerEvents="none"
      data-table={table.id}
    >
      <chakra.button
        type="button"
        position="absolute"
        inset="0"
        pointerEvents="auto"
        cursor="pointer"
        aria-label={`${table.name} ${filled} / ${table.seats}, ${status}${armed ? ". Press to seat the picked-up guest here." : ""}`}
        aria-pressed={selected}
        borderRadius={round ? "full" : "2xl"}
        borderWidth="2px"
        borderStyle={over || (hint && !selected) ? "dashed" : "solid"}
        borderColor={borderColor}
        bg={over ? "brand.muted" : selected ? "brand.subtle" : "bg.panel/70"}
        outline={selected && flagged > 0 ? "2px solid" : undefined}
        outlineColor="brand.solid"
        outlineOffset="2px"
        transition="background 120ms, border-color 120ms"
        _hover={{ bg: selected ? "brand.subtle" : "bg.panel", borderColor: flagged > 0 ? "red.solid" : "brand.emphasized" }}
        _focusVisible={{ outline: "3px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" }}
        onClick={() => {
          if (plan.armedGuestId) plan.place(plan.armedGuestId, table.id)
          else plan.selectTable(table.id)
        }}
        onDragOver={onDragOver}
        onDragLeave={() => {
          if (overTableId === table.id) setOverTableId(null)
        }}
        onDrop={(e: React.DragEvent) => onDrop(e)}
      />
      <Box
          position="absolute"
          left={pct(g.body.x, g.w)}
          top={pct(g.body.y, g.h)}
          w={pct(g.body.w, g.w)}
          h={pct(g.body.h, g.h)}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.emphasized"
          borderRadius={round ? "full" : "lg"}
          shadow="xs"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="auto"
          cursor="pointer"
          aria-hidden="true"
          onClick={() => {
            if (plan.armedGuestId) plan.place(plan.armedGuestId, table.id)
            else plan.selectTable(table.id)
          }}
          onDragOver={onDragOver}
          onDrop={(e: React.DragEvent) => onDrop(e)}
        >
          <Stack as="span" gap="0" align="center" lineHeight="1.15" textAlign="center">
            <Text as="span" display="block" fontWeight="semibold" fontSize="max(10px, 1.2cqw)" color="fg" whiteSpace="nowrap">
              {table.name}
            </Text>
            <Text
              as="span"
              display="block"
              fontSize="max(9px, 1.05cqw)"
              color={full ? "green.fg" : "fg.muted"}
              fontWeight="medium"
              whiteSpace="nowrap"
            >
              {filled} / {table.seats}
            </Text>
          </Stack>
      </Box>

      {flagged > 0 ? (
        <Box
          position="absolute"
          top="0"
          right="0"
          boxSize="max(16px, 1.9cqw)"
          borderRadius="full"
          bg="red.solid"
          color="red.contrast"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="max(10px, 1.2cqw)"
          pointerEvents="none"
          zIndex="2"
          aria-hidden="true"
        >
          <MdWarning />
        </Box>
      ) : null}

      {g.seatCentres.map((c, i) => {
        const gid = row[i] ?? null
        const guest = gid ? guestById[gid] : undefined
        const palette = guest ? partyPalette(guest.party) : "gray"
        const isFlagged = gid ? plan.flaggedGuests.has(gid) : false
        const isArmed = gid !== null && plan.armedGuestId === gid
        const isFocus = gid !== null && plan.focusGuestId === gid
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${isFlagged ? ", involved in a broken rule" : ""}`
          : `${table.name}, seat ${i + 1}: empty${armed ? ". Press to seat the picked-up guest here." : ""}`
        const seatButton = (
          <chakra.button
            type="button"
            colorPalette={palette}
            position="absolute"
            left={pct(c.x - g.seatSize / 2, g.w)}
            top={pct(c.y - g.seatSize / 2, g.h)}
            w={pct(g.seatSize, g.w)}
            h={pct(g.seatSize, g.h)}
            borderRadius="full"
            pointerEvents="auto"
            zIndex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="max(9px, 1.05cqw)"
            fontWeight="semibold"
            lineHeight="1"
            cursor={guest ? "grab" : "pointer"}
            borderWidth="2px"
            borderStyle={guest ? "solid" : "dashed"}
            borderColor={guest ? "colorPalette.solid" : armed || dragging ? "brand.solid" : "border.emphasized"}
            bg={guest ? "colorPalette.muted" : armed || dragging ? "brand.subtle" : "bg.panel"}
            color={guest ? "colorPalette.fg" : "fg.subtle"}
            outline={isFlagged || isArmed || isFocus ? "2.5px solid" : undefined}
            outlineColor={isFlagged ? "red.solid" : "brand.solid"}
            outlineOffset="1px"
            transform={isArmed ? "scale(1.12)" : undefined}
            transition="transform 120ms, background 120ms"
            _hover={{ transform: "scale(1.1)" }}
            _focusVisible={{ outline: "3px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" }}
            aria-label={label}
            draggable={!!guest}
            onClick={() => {
              if (plan.armedGuestId) {
                if (plan.armedGuestId === gid) plan.armGuest(null)
                else plan.place(plan.armedGuestId, table.id, i)
              } else plan.selectTable(table.id, gid)
            }}
            onDragStart={(e: React.DragEvent) => {
              if (!gid) return
              e.dataTransfer.setData("text/plain", gid)
              e.dataTransfer.effectAllowed = "move"
              plan.setDragGuest(gid)
            }}
            onDragEnd={() => {
              plan.setDragGuest(null)
              setOverTableId(null)
            }}
            onDragOver={onDragOver}
            onDragLeave={() => {
              if (overTableId === table.id) setOverTableId(null)
            }}
            onDrop={(e: React.DragEvent) => onDrop(e, i)}
            data-initials={guest ? initials(guest.name) : undefined}
            _before={guest ? { content: "attr(data-initials)" } : undefined}
          >
            {guest?.diet ? (
              <Box
                as="span"
                position="absolute"
                top="-6%"
                right="-6%"
                boxSize="34%"
                borderRadius="full"
                bg="yellow.400"
                borderWidth="1.5px"
                borderColor="bg.panel"
                aria-hidden="true"
              />
            ) : null}
          </chakra.button>
        )
        return guest ? (
          <Tooltip
            key={i}
            openDelay={250}
            positioning={{ placement: "top" }}
            content={`${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`}
          >
            {seatButton}
          </Tooltip>
        ) : (
          <React.Fragment key={i}>{seatButton}</React.Fragment>
        )
      })}
    </Box>
  )
}
