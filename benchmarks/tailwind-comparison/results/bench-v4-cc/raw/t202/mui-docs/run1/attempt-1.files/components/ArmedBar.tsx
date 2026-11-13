"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PersonOff from "@mui/icons-material/PersonOff";
import { TABLES, guestById } from "@/lib/data";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

/** Shown while a guest is picked up: says what to do next and offers a plain select as an alternative to the plan. */
export default function ArmedBar() {
  const plan = usePlan();
  const id = plan.state.armed;
  if (!id) return null;
  const guest = guestById[id];
  const seated = plan.guestTable[id] !== null;

  return (
    <Paper
      variant="outlined"
      role="status"
      sx={{ p: 1.5, borderColor: "primary.main", bgcolor: tint("primary-main", 10) }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { sm: "center" } }}>
        <Typography variant="body2" sx={{ flex: 1 }}>
          {seated ? "Moving" : "Seating"} <strong>{guest.name}</strong>. Tap a seat or table on the plan, or press Esc to cancel.
        </Typography>
        <TextField
          select
          size="small"
          label="Or choose a table"
          value=""
          onChange={(e) => {
            if (e.target.value) plan.place(id, e.target.value);
          }}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          sx={{ minWidth: 200, bgcolor: "background.paper" }}
        >
          <option value="" disabled>
            Select…
          </option>
          {TABLES.map((t) => {
            const free = t.seats - plan.tableFill[t.id];
            const here = plan.guestTable[id] === t.id;
            return (
              <option key={t.id} value={t.id} disabled={here || free === 0}>
                {t.name} ({free} free)
              </option>
            );
          })}
        </TextField>
        {seated ? (
          <Button startIcon={<PersonOff />} variant="outlined" onClick={() => plan.unseat(id)}>
            Unseat
          </Button>
        ) : null}
        <Button startIcon={<Close />} onClick={() => plan.arm(null)}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
