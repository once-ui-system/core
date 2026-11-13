"use client"

import { Badge, Box } from "@chakra-ui/react"
import type { Rsvp } from "@/lib/data"

export type Palette =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "cyan"
  | "purple"
  | "pink"

export const PARTY_PALETTE: Record<string, Palette> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "blue",
  "University friends": "orange",
  "Work friends": "cyan",
  "Groom's football club": "green",
  "Plus-ones": "gray",
}
export const partyPalette = (party: string): Palette => PARTY_PALETTE[party] ?? "gray"

const DIET_PALETTE: Record<string, Palette> = {
  Vegetarian: "green",
  Vegan: "green",
  "Gluten free": "yellow",
  "Soft food": "purple",
  "Nut allergy": "red",
  Halal: "blue",
  Pescatarian: "cyan",
  "Children's menu": "pink",
}
export const dietPalette = (diet: string): Palette => DIET_PALETTE[diet] ?? "gray"

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}
const RSVP_PALETTE: Record<Rsvp, Palette> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge colorPalette={RSVP_PALETTE[rsvp]} variant="subtle" size="sm">
      {RSVP_LABEL[rsvp]}
    </Badge>
  )
}

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null
  return (
    <Badge colorPalette={dietPalette(diet)} variant="subtle" size="sm">
      {diet}
    </Badge>
  )
}

export function PartyDot({ party }: { party: string }) {
  return (
    <Box
      aria-hidden
      display="inline-block"
      w="2.5"
      h="2.5"
      borderRadius="full"
      flexShrink={0}
      colorPalette={partyPalette(party)}
      bg="colorPalette.solid"
    />
  )
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
