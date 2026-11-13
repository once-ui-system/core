"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PersonOff from "@mui/icons-material/PersonOff";
import { guestById, tableById } from "@/lib/data";
import { ruleTitle } from "@/lib/seating";
import { tint } from "@/lib/ui";
import GuestRow from "./GuestRow";
import { usePlan } from "./PlanProvider";

export default function TablePanel() {
  const plan = usePlan();
  const id = plan.state.selectedTable;
  const table = id ? tableById[id] : null;

  if (!table) {
    return (
      <Paper variant="outlined" component="section" aria-labelledby="table-title" sx={{ p: 1.5 }}>
        <Typography id="table-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          Table details
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Select a table on the plan to see who is sitting there and what they eat.
        </Typography>
      </Paper>
    );
  }

  const row = plan.state.seats[table.id];
  const guests = row.map((gid) => (gid ? guestById[gid] : null));
  const seated = guests.filter((g): g is NonNullable<typeof g> => g !== null);
  const dietCounts: Record<string, number> = {};
  for (const g of seated) if (g.diet) dietCounts[g.diet] = (dietCounts[g.diet] ?? 0) + 1;
  const dietEntries = Object.entries(dietCounts);
  const broken = plan.brokenByTable[table.id] ?? [];
  const armedId = plan.state.armed;

  return (
    <Paper variant="outlined" component="section" aria-labelledby="table-title" sx={{ p: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography id="table-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
            {table.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {seated.length} of {row.length} seats filled · {row.length - seated.length} free
          </Typography>
        </Box>
        <IconButton aria-label="Close table details" size="small" onClick={() => plan.selectTable(null)}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {broken.map((r) => (
        <Alert key={r.rule.id} severity="error" sx={{ mt: 1, py: 0 }}>
          <strong>{ruleTitle(r.rule)}.</strong> {r.message}
        </Alert>
      ))}

      <Box sx={{ mt: 1.25 }}>
        <Typography variant="overline" component="h3" sx={{ lineHeight: 1.5, color: "text.secondary" }}>
          Dietary needs
        </Typography>
        {dietEntries.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {seated.length === 0 ? "No one seated yet." : "No dietary needs at this table."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {dietEntries.map(([diet, n]) => (
              <Chip key={diet} size="small" color="warning" variant="outlined" label={`${diet} × ${n}`} />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <Typography variant="overline" component="h3" sx={{ lineHeight: 1.5, color: "text.secondary" }}>
          Guests
        </Typography>
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {guests.map((g, i) => (
            <li key={`${table.id}-${i}`}>
              {g ? (
                <GuestRow
                  guest={g}
                  lead={
                    <Typography variant="caption" sx={{ width: 14, textAlign: "right", color: "text.secondary" }} aria-hidden>
                      {i + 1}
                    </Typography>
                  }
                  action={
                    <IconButton aria-label={`Unseat ${g.name}`} size="small" onClick={() => plan.unseat(g.id)}>
                      <PersonOff fontSize="small" />
                    </IconButton>
                  }
                />
              ) : (
                <Box
                  role={armedId ? "button" : undefined}
                  tabIndex={armedId ? 0 : undefined}
                  aria-label={armedId ? `Seat ${guestById[armedId].name} in seat ${i + 1}` : undefined}
                  onClick={armedId ? () => plan.place(armedId, table.id, i) : undefined}
                  onKeyDown={
                    armedId
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            plan.place(armedId, table.id, i);
                          }
                        }
                      : undefined
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1,
                    minHeight: 40,
                    borderRadius: 1.5,
                    color: "text.secondary",
                    cursor: armedId ? "pointer" : "default",
                    "&:hover": armedId ? { bgcolor: tint("primary-main", 12) } : undefined,
                  }}
                >
                  <Typography variant="caption" sx={{ width: 14, textAlign: "right" }} aria-hidden>
                    {i + 1}
                  </Typography>
                  <Box
                    aria-hidden
                    sx={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.disabled" }}
                  />
                  <Typography variant="body2">{armedId ? "Empty seat: tap to place here" : "Empty seat"}</Typography>
                </Box>
              )}
            </li>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
