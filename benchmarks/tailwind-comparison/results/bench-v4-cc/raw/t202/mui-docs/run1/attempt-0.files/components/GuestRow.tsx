"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { RSVP_LABEL, initials, type Guest } from "@/lib/data";
import { RULE_GUEST_IDS } from "@/lib/seating";
import { partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

interface Props {
  guest: Guest;
  /** shown before the avatar, e.g. a seat number */
  lead?: React.ReactNode;
  action?: React.ReactNode;
}

/** A guest you can tap to pick up (then tap a seat or table) or drag onto a seat or table. */
export default function GuestRow({ guest, lead, action }: Props) {
  const plan = usePlan();
  const armed = plan.state.armed === guest.id;
  const flagged = plan.brokenGuests.has(guest.id);
  const hasRule = RULE_GUEST_IDS.has(guest.id);
  const c = partyColor(guest.party);
  const toggle = () => plan.arm(armed ? null : guest.id);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        role="button"
        tabIndex={0}
        draggable
        aria-pressed={armed}
        aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${
          guest.rsvp !== "yes" ? `, ${RSVP_LABEL[guest.rsvp]}` : ""
        }${flagged ? ", breaks a seating rule" : ""}. ${armed ? "Picked up. Choose a seat or table." : "Press to pick up."}`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          plan.setDragging(guest.id);
        }}
        onDragEnd={() => plan.setDragging(null)}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1,
          py: 0.75,
          minHeight: 48,
          borderRadius: 1.5,
          cursor: "grab",
          border: "1.5px solid",
          borderColor: armed ? "primary.main" : "transparent",
          bgcolor: armed ? tint("primary-main", 14) : "transparent",
          "&:hover": { bgcolor: armed ? tint("primary-main", 18) : tint("text-primary", 6) },
          "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 1 },
        }}
      >
        {lead}
        <Box
          aria-hidden
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
            bgcolor: c.tint,
            border: `2px solid ${c.solid}`,
          }}
        >
          {initials(guest.name)}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {guest.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="p">
            {guest.party}
          </Typography>
        </Box>
        {guest.diet ? <Chip size="small" variant="outlined" label={guest.diet} /> : null}
        {guest.rsvp !== "yes" ? (
          <Chip size="small" color={guest.rsvp === "no" ? "error" : "warning"} variant="outlined" label={RSVP_LABEL[guest.rsvp]} />
        ) : null}
        {flagged ? (
          <WarningAmber fontSize="small" color="error" titleAccess="Breaks a seating rule" />
        ) : hasRule ? (
          <Box component="span" title="Has a seating rule" aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "secondary.main", flexShrink: 0 }} />
        ) : null}
      </Box>
      {action}
    </Box>
  );
}
