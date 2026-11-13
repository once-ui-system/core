"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Stack from "@/lib/stack";
import { guestById, initials, partyColor, tableById, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";

export default function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTableId ? tableById[plan.selectedTableId] : null;
  const occ = table ? plan.occupants(table.id) : [];
  const seated = occ.filter((g) => g !== null);
  const diets: Record<string, number> = {};
  for (const g of seated) if (g && g.diet) diets[g.diet] = (diets[g.diet] ?? 0) + 1;
  const flags = table ? (plan.tableFlags[table.id] ?? []) : [];
  const heldId = plan.heldId;

  return (
    <Paper variant="outlined" component="section" aria-label="Selected table" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          Table details
        </Typography>
        <TextField
          select
          size="small"
          label="Table"
          value={plan.selectedTableId ?? ""}
          onChange={(e) => plan.selectTable(e.target.value || null)}
          sx={{ minWidth: 170 }}
        >
          {tables.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name} ({plan.filled(t.id)}/{t.seats})
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {!table ? (
        <Typography variant="body2" color="text.secondary">
          Select a table on the plan to see who sits there and what they eat.
        </Typography>
      ) : (
        <>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Chip label={`${seated.length} of ${table.seats} seats filled`} size="small" color={seated.length === table.seats ? "success" : "default"} />
            {Object.keys(diets).length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No dietary needs recorded
              </Typography>
            ) : (
              Object.entries(diets).map(([d, n]) => <Chip key={d} size="small" variant="outlined" label={`${d} × ${n}`} />)
            )}
          </Stack>

          {flags.map((r) => (
            <Stack key={r.id} direction="row" spacing={1} sx={{ mb: 1, p: 1, borderRadius: 1.5, bgcolor: tint("error-main", 10) }}>
              <WarningAmberIcon color="error" fontSize="small" />
              <Typography variant="body2">
                <strong>{r.label}:</strong> {r.subject}. {r.detail}
              </Typography>
            </Stack>
          ))}

          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0.75 }}>
            {occ.map((g, i) => (
              <Box
                component="li"
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 0.75,
                  borderRadius: 1.5,
                  border: 1,
                  borderStyle: g ? "solid" : "dashed",
                  borderColor: g && heldId === g.id ? "primary.main" : "divider",
                  minHeight: 52,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 18, textAlign: "right" }}>
                  {i + 1}
                </Typography>
                {g ? (
                  <>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: partyColor(g.party), color: "#fff" }}>
                      {initials(g.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {g.party}
                        {g.rsvp !== "yes" ? ` · ${g.rsvp === "maybe" ? "maybe" : "reply pending"}` : ""}
                      </Typography>
                    </Box>
                    {g.diet ? <Chip size="small" label={g.diet} color="warning" variant="outlined" /> : null}
                    {(plan.guestFlags[g.id] ?? []).length > 0 ? (
                      <WarningAmberIcon color="error" fontSize="small" titleAccess="Rule broken" />
                    ) : null}
                    <IconButton
                      size="small"
                      aria-label={`Move ${g.name} to another table`}
                      title="Pick up to move"
                      onClick={() => plan.pick(g.id)}
                      sx={{ width: 40, height: 40 }}
                    >
                      <OpenWithIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => plan.unseat(g.id)}
                      sx={{ width: 40, height: 40 }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Empty seat
                    </Typography>
                    {heldId ? (
                      <Button size="small" onClick={() => plan.place(heldId, table.id, i)} sx={{ minHeight: 40 }}>
                        Seat {guestById[heldId].name.split(" ")[0]} here
                      </Button>
                    ) : null}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}
