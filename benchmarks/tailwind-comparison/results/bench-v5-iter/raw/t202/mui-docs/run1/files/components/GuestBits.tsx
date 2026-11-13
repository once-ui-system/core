"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { FALLBACK_PARTY_COLOR, initials, partyColors, rsvpLabels, type Guest, type Rsvp } from "@/lib/data";

export function GuestDot({ guest, size = 32 }: { guest: Guest; size?: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        bgcolor: partyColors[guest.party] ?? FALLBACK_PARTY_COLOR,
        color: "common.white",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0.2,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

export function dietColor(diet: string): "error" | "warning" | "info" {
  if (/allergy/i.test(diet)) return "error";
  if (/children/i.test(diet)) return "info";
  return "warning";
}

export function DietChip({ diet }: { diet: string }) {
  return <Chip size="small" variant="outlined" color={dietColor(diet)} label={diet} />;
}

export function RsvpChip({ rsvp }: { rsvp: Rsvp }) {
  const color = rsvp === "yes" ? "success" : rsvp === "no" ? "error" : "default";
  return (
    <Chip
      size="small"
      variant={rsvp === "yes" ? "filled" : "outlined"}
      color={color}
      label={rsvpLabels[rsvp]}
      sx={rsvp === "yes" ? { bgcolor: "success.main", color: "success.contrastText" } : undefined}
    />
  );
}
