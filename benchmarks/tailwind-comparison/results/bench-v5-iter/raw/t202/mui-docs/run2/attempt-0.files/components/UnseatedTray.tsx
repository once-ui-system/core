"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "./Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import { guests } from "@/lib/data";
import type { Guest } from "@/lib/data";
import { initials, partyColor, partyText, rsvpLabel } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { V, mix } from "./ui";

export function GuestDot({ guest, size = 28 }: { guest: Guest; size?: number }) {
  return (
    <Box
      aria-hidden
      component="span"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: partyColor(guest.party),
        color: partyText(guest.party),
        display: "inline-grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

function GuestPick({ guest }: { guest: Guest }) {
  const { holding, setHolding, setDragId } = usePlan();
  const active = holding === guest.id;
  const unconfirmed = guest.rsvp !== "yes";
  return (
    <ButtonBase
      draggable
      aria-pressed={active}
      onClick={() => setHolding(active ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      sx={{
        gap: 1,
        pl: 0.5,
        pr: 1.5,
        py: 0.5,
        minHeight: 44,
        borderRadius: 6,
        border: `1.5px ${unconfirmed ? "dashed" : "solid"} ${active ? V.primary : V.divider}`,
        bgcolor: active ? mix(V.primary, 16) : V.paper,
        cursor: "grab",
        textAlign: "left",
        justifyContent: "flex-start",
        "&:hover": { borderColor: V.primary },
        "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 2 },
      }}
    >
      <GuestDot guest={guest} size={32} />
      <Box component="span" sx={{ display: "block", lineHeight: 1.2 }}>
        <Box component="span" sx={{ display: "block", fontSize: 14, fontWeight: 600, color: V.text }}>
          {guest.name}
        </Box>
        <Box component="span" sx={{ display: "block", fontSize: 12, color: V.text2 }}>
          {guest.party}
          {guest.diet ? ` · ${guest.diet}` : ""}
          {unconfirmed ? ` · ${rsvpLabel[guest.rsvp]}` : ""}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export function UnseatedTray() {
  const { assign, stats, dragId, setDragId, unseat } = usePlan();
  const [over, setOver] = React.useState(false);

  const needSeat = guests.filter((g) => g.rsvp === "yes" && !assign[g.id]);
  const maybe = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]);

  return (
    <Card
      component="section"
      aria-labelledby="tray-title"
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!dragId) return;
        e.preventDefault();
        unseat(dragId);
        setDragId(null);
        setOver(false);
      }}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: over ? V.primary : undefined,
        borderStyle: over ? "dashed" : undefined,
        bgcolor: over ? mix(V.primary, 8) : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
        <Typography id="tray-title" variant="h2" component="h2">
          Needs a seat
        </Typography>
        <Chip
          size="small"
          label={stats.unseated}
          color={stats.unseated ? "warning" : "success"}
          aria-label={`${stats.unseated} attending guests without a seat`}
          sx={{ fontWeight: 700 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", display: { xs: "none", sm: "block" } }}>
          Drop a seated guest here to unseat them
        </Typography>
      </Stack>

      {needSeat.length === 0 ? (
        <Stack direction="row" alignItems="center" gap={1} sx={{ color: "success.main", py: 1 }}>
          <CheckCircleOutline fontSize="small" />
          <Typography variant="body2">Everyone who is coming has a seat.</Typography>
        </Stack>
      ) : (
        <Stack component="ul" direction="row" flexWrap="wrap" gap={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {needSeat.map((g) => (
            <li key={g.id}>
              <GuestPick guest={g} />
            </li>
          ))}
        </Stack>
      )}

      {maybe.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
            WAITING ON AN RSVP · {maybe.length}
          </Typography>
          <Stack component="ul" direction="row" flexWrap="wrap" gap={1} sx={{ listStyle: "none", m: 0, mt: 0.75, p: 0 }}>
            {maybe.map((g) => (
              <li key={g.id}>
                <GuestPick guest={g} />
              </li>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Card>
  );
}
