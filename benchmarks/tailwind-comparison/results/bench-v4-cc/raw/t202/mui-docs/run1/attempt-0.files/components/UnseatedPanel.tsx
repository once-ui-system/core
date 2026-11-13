"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";
import { guestById, type Guest } from "@/lib/data";
import { tint } from "@/lib/ui";
import GuestRow from "./GuestRow";
import { usePlan } from "./PlanProvider";

function byPartyThenName(a: Guest, b: Guest) {
  return a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
}

export default function UnseatedPanel() {
  const plan = usePlan();
  const [q, setQ] = React.useState("");
  const [dropOver, setDropOver] = React.useState(false);

  const needle = q.trim().toLowerCase();
  const match = (g: Guest) =>
    !needle || g.name.toLowerCase().includes(needle) || g.party.toLowerCase().includes(needle) || (g.diet ?? "").toLowerCase().includes(needle);
  const list = plan.unseated.filter(match).sort(byPartyThenName);
  const awaiting = plan.awaiting.filter(match).sort(byPartyThenName);
  const dragSeated = plan.dragging !== null && plan.guestTable[plan.dragging] != null;

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="unseated-title"
      onDragOver={(e) => {
        if (dragSeated) {
          e.preventDefault();
          setDropOver(true);
        }
      }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropOver(false);
        const id = plan.dragging ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id && guestById[id] && plan.guestTable[id]) plan.unseat(id);
      }}
      sx={{
        p: 1.5,
        borderStyle: dragSeated ? "dashed" : "solid",
        borderColor: dropOver ? "primary.main" : dragSeated ? "primary.main" : "divider",
        bgcolor: dropOver ? tint("primary-main", 10) : "background.paper",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography id="unseated-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          Needs a seat
        </Typography>
        <Chip size="small" color={plan.unseated.length ? "warning" : "success"} label={plan.unseated.length} aria-label={`${plan.unseated.length} guests need a seat`} />
      </Stack>

      {dragSeated ? (
        <Typography variant="body2" color="primary" sx={{ py: 1, fontWeight: 600 }}>
          Drop here to unseat
        </Typography>
      ) : null}

      {plan.unseated.length > 4 ? (
        <TextField
          size="small"
          fullWidth
          placeholder="Filter by name, party or diet"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Filter guests who need a seat" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1 }}
        />
      ) : null}

      {plan.unseated.length === 0 ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1.5, color: "success.main" }}>
          <CheckCircle fontSize="small" />
          <Typography variant="body2">Everyone attending has a seat.</Typography>
        </Stack>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, maxHeight: { lg: 340 }, overflowY: "auto" }}>
          {list.map((g) => (
            <li key={g.id}>
              <GuestRow guest={g} />
            </li>
          ))}
          {list.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              No one matches “{q}”.
            </Typography>
          ) : null}
        </Box>
      )}

      {awaiting.length > 0 ? (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="overline" color="text.secondary" component="h3" sx={{ lineHeight: 1.5 }}>
            Not confirmed yet ({awaiting.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 0.5 }}>
            You can hold a seat for them. They are not counted as attending.
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {awaiting.map((g) => (
              <li key={g.id}>
                <GuestRow guest={g} />
              </li>
            ))}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
