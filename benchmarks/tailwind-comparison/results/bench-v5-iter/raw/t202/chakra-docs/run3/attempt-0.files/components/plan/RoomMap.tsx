"use client"

import { Box, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { fixtures, tables, type Fixture } from "@/lib/data"
import { ROOM } from "@/lib/plan"
import { TableView } from "./TableView"

const px = (m: number) => `${(m / ROOM.width) * 100}%`
const py = (m: number) => `${(m / ROOM.depth) * 100}%`

const FIXTURE_STYLE: Record<
  Fixture["kind"],
  { bg: string; color: string; borderColor: string; borderStyle?: string }
> = {
  stage: { bg: "bg.inverted", color: "fg.inverted", borderColor: "bg.inverted" },
  dancefloor: { bg: "brand.muted", color: "brand.fg", borderColor: "brand.emphasized", borderStyle: "dashed" },
  bar: { bg: "orange.muted", color: "orange.fg", borderColor: "orange.emphasized" },
  door: { bg: "green.solid", color: "green.fg", borderColor: "green.solid" },
}

function gridPath(): string {
  let d = ""
  for (let i = 1; i < ROOM.width; i++) d += `M${i} 0V${ROOM.depth}`
  for (let j = 1; j < ROOM.depth; j++) d += `M0 ${j}H${ROOM.width}`
  return d
}

function FixtureView({ f }: { f: Fixture }) {
  const s = FIXTURE_STYLE[f.kind]
  if (f.kind === "door") {
    return (
      <>
        <Box
          position="absolute"
          left={px(f.x)}
          top={py(f.y)}
          w={px(f.w)}
          h={py(f.h)}
          bg={s.bg}
          borderRadius="sm"
          zIndex="1"
          title={f.label}
        />
        <Text
          position="absolute"
          left={px(f.x + f.w + 0.08)}
          top={py(f.y)}
          h={py(f.h)}
          fontSize="max(9px, 1cqw)"
          fontWeight="semibold"
          color={s.color}
          css={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          whiteSpace="nowrap"
          zIndex="1"
        >
          {f.label}
        </Text>
      </>
    )
  }
  return (
    <Box
      position="absolute"
      left={px(f.x)}
      top={py(f.y)}
      w={px(f.w)}
      h={py(f.h)}
      bg={s.bg}
      color={s.color}
      borderWidth="1.5px"
      borderColor={s.borderColor}
      borderStyle={s.borderStyle ?? "solid"}
      borderRadius={f.kind === "dancefloor" ? "lg" : "md"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      lineHeight="1.2"
      zIndex="0"
    >
      <Text as="span" fontWeight="semibold" fontSize="max(10px, 1.3cqw)" fontFamily={f.kind === "dancefloor" ? "heading" : undefined}>
        {f.label}
      </Text>
      <Text as="span" fontSize="max(9px, 0.95cqw)" opacity={0.8}>
        {f.w} × {f.h} m
      </Text>
    </Box>
  )
}

export function RoomMap() {
  const [overTableId, setOverTableId] = React.useState<string | null>(null)

  return (
    <Box
      overflowX="auto"
      borderRadius="lg"
      tabIndex={0}
      role="region"
      aria-label="Room plan, scrollable"
      _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
    >
      <Box
        position="relative"
        minW="780px"
        w="100%"
        bg="bg.subtle"
        borderRadius="md"
        css={{ containerType: "inline-size", aspectRatio: `${ROOM.width} / ${ROOM.depth}` }}
        role="group"
        aria-label={`Room, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale`}
      >
        <chakra.svg
          position="absolute"
          inset="0"
          w="100%"
          h="100%"
          color="border.muted"
          viewBox={`0 0 ${ROOM.width} ${ROOM.depth}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={gridPath()} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
        </chakra.svg>
        <Box
          position="absolute"
          inset="0"
          borderWidth="3px"
          borderColor="border.emphasized"
          borderRadius="md"
          pointerEvents="none"
          zIndex="0"
        />

        {fixtures.map((f) => (
          <FixtureView key={f.id} f={f} />
        ))}

        <Box
          position="absolute"
          left={px(5.5)}
          top={py(12.7)}
          w={px(4.2)}
          color="fg.muted"
          fontSize="max(9px, 0.95cqw)"
          lineHeight="1.2"
          pointerEvents="none"
          aria-hidden="true"
        >
          <Box h="6px" borderWidth="0 2px 2px 2px" borderStyle="solid" borderColor="fg.muted" />
          <Text mt="0.5" textAlign="center" as="span" display="block">
            4 m · room {ROOM.width} × {ROOM.depth} m
          </Text>
        </Box>

        {tables.map((t) => (
          <TableView key={t.id} table={t} overTableId={overTableId} setOverTableId={setOverTableId} />
        ))}
      </Box>
    </Box>
  )
}
