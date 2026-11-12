"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { initials, partyColor, tableById, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  guest: Guest;
  actions?: React.ReactNode;
  showTable?: boolean;
  sx?: SxProps<Theme>;
};

export default function GuestRow({ guest, actions, showTable = false, sx }: Props) {
  const plan = usePlan();
  const held = plan.heldId === guest.id;
  const flagged = (plan.guestFlags[guest.id] ?? []).length > 0;
  const seat = plan.assign[guest.id];
  const canMove = guest.rsvp !== "no";

  return (
    <Box
      draggable={canMove}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(guest.id);
      }}
      onDragEnd={() => plan.setDragId(null)}
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderRadius: 2,
          border: 1,
          borderColor: held ? "primary.main" : "divider",
          bgcolor: held ? tint("primary-main", 12) : "background.paper",
          outline: held ? "2px solid var(--mui-palette-primary-main)" : "none",
          cursor: canMove ? "grab" : "default",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <ButtonBase
        onClick={() => plan.pick(guest.id)}
        aria-pressed={held}
        aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${
          seat ? `, at ${tableById[seat.tableId].name}` : ", not seated"
        }. ${held ? "Selected to move" : "Select to move"}`}
        sx={{
          flex: 1,
          minWidth: 0,
          justifyContent: "flex-start",
          textAlign: "left",
          gap: 1.25,
          p: 1,
          minHeight: 48,
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: partyColor(guest.party), color: "#fff" }}>
          {initials(guest.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {guest.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {guest.party}
            {showTable && seat ? ` · ${tableById[seat.tableId].name}` : ""}
          </Typography>
        </Box>
      </ButtonBase>
      {guest.diet ? <Chip size="small" label={guest.diet} variant="outlined" sx={{ flexShrink: 0 }} /> : null}
      {flagged ? (
        <WarningAmberIcon color="error" fontSize="small" titleAccess="A seating rule is broken for this guest" />
      ) : null}
      {actions}
      {actions ? null : <Box sx={{ width: 4 }} />}
    </Box>
  );
}
