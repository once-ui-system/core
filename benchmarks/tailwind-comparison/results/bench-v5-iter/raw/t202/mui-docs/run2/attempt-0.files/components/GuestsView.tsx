"use client";

import * as React from "react";
import NextLink from "next/link";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "./Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import Search from "@mui/icons-material/Search";
import { event, guests, tables } from "@/lib/data";
import type { Guest, Rsvp } from "@/lib/data";
import {
  STANDARD_MEAL,
  formatDate,
  meals,
  mealOf,
  parties,
  partyColor,
  rsvpLabel,
  tableById,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { GuestDot } from "./UnseatedTray";
import { V, mix } from "./ui";

const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];
const rsvpColor: Record<Rsvp, "success" | "warning" | "info" | "default"> = {
  yes: "success",
  maybe: "warning",
  pending: "info",
  no: "default",
};

/* ---------- caterer panel ---------- */

function MealCounts() {
  const { assign } = usePlan();
  const confirmed = guests.filter((g) => g.rsvp === "yes");
  const unconfirmed = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");

  const count = (list: Guest[], meal: string) => list.filter((g) => mealOf(g) === meal).length;
  const columns = [...tables.map((t) => ({ id: t.id, label: t.name })), { id: "none", label: "No table" }];
  const inColumn = (g: Guest, col: string) => (col === "none" ? !assign[g.id] : assign[g.id]?.table === col);

  return (
    <Card component="section" aria-labelledby="meals-title" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
        <Box>
          <Typography id="meals-title" variant="h2" component="h2">
            Meals for the caterer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {confirmed.length} guests have said yes
            {unconfirmed.length ? `, ${unconfirmed.length} more have not confirmed` : ""}. Declined guests are not counted.
          </Typography>
        </Box>
        <Button variant="outlined" size="small" startIcon={<PrintOutlined />} onClick={() => window.print()}>
          Print
        </Button>
      </Stack>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          mt: 2,
          p: 0,
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))", xl: "repeat(10, minmax(0, 1fr))" },
        }}
      >
        <Box
          component="li"
          sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}
        >
          <Typography component="p" sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
            {confirmed.length}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Total covers
          </Typography>
        </Box>
        {meals.map((m) => {
          const n = count(confirmed, m);
          const extra = count(unconfirmed, m);
          return (
            <Box key={m} component="li" sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${V.divider}`, bgcolor: m === STANDARD_MEAL ? "transparent" : mix(V.warning, 7) }}>
              <Typography component="p" sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                {n}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {m}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {extra ? `+${extra} unconfirmed` : " "}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{ mt: 2, border: `1px solid ${V.divider}`, borderRadius: "12px !important", "&::before": { display: "none" }, bgcolor: "transparent" }}
      >
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="by-table-panel" id="by-table-header">
          <Typography sx={{ fontWeight: 700 }}>Meals by table (confirmed guests)</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }} id="by-table-panel">
          <TableContainer>
            <Table size="small" aria-label="Meals by table">
              <TableHead>
                <TableRow>
                  <TableCell>Meal</TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.id} align="right" sx={{ whiteSpace: "nowrap" }}>
                      {c.label}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((m) => {
                  const row = confirmed.filter((g) => mealOf(g) === m);
                  return (
                    <TableRow key={m}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {m}
                      </TableCell>
                      {columns.map((c) => {
                        const n = row.filter((g) => inColumn(g, c.id)).length;
                        return (
                          <TableCell key={c.id} align="right" sx={{ color: n ? "text.primary" : "text.disabled" }}>
                            {n || "–"}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {row.length}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 800 }}>
                    All meals
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.id} align="right" sx={{ fontWeight: 800 }}>
                      {confirmed.filter((g) => inColumn(g, c.id)).length}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {confirmed.length}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

/* ---------- guest list ---------- */

export function GuestsView() {
  const { assign } = usePlan();
  const [q, setQ] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");
  const [seat, setSeat] = React.useState("all");

  const diets = meals.filter((m) => m !== STANDARD_MEAL);

  const filtered = guests.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (party !== "all" && g.party !== party) return false;
    if (rsvp !== "all" && g.rsvp !== rsvp) return false;
    if (diet === "none" ? g.diet !== null : diet !== "all" && g.diet !== diet) return false;
    if (seat === "seated" && !assign[g.id]) return false;
    if (seat === "unseated" && assign[g.id]) return false;
    return true;
  });

  const active = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seat !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeat("all");
  };

  return (
    <Stack gap={2.5}>
      <Box>
        <Typography variant="h1" component="h1">
          Guest list
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {event.name} · {formatDate(event.date)} · {guests.length} invited
        </Typography>
      </Box>

      <MealCounts />

      <Card component="section" aria-labelledby="guests-title" sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Typography id="guests-title" variant="h2" component="h2" sx={{ mb: 1.5 }}>
          All guests
        </Typography>

        <Box
          role="search"
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "minmax(220px, 1.6fr) repeat(4, minmax(0, 1fr))" },
          }}
        >
          <TextField
            size="small"
            label="Search by name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select size="small" label="Party" value={party} onChange={(e) => setParty(e.target.value)}>
            <MenuItem value="all">All parties</MenuItem>
            {parties.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="RSVP" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
            <MenuItem value="all">Any RSVP</MenuItem>
            {RSVPS.map((r) => (
              <MenuItem key={r} value={r}>
                {rsvpLabel[r]}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
            <MenuItem value="all">Any diet</MenuItem>
            <MenuItem value="none">No dietary need</MenuItem>
            {diets.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Seating" value={seat} onChange={(e) => setSeat(e.target.value)}>
            <MenuItem value="all">Seated or not</MenuItem>
            <MenuItem value="seated">Seated</MenuItem>
            <MenuItem value="unseated">Not seated</MenuItem>
          </TextField>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 1.5 }}>
          <Typography variant="body2" color="text.secondary" role="status">
            Showing {filtered.length} of {guests.length} guests
          </Typography>
          {active ? (
            <Button size="small" onClick={reset}>
              Clear filters
            </Button>
          ) : null}
        </Stack>

        <TableContainer sx={{ border: `1px solid ${V.divider}`, borderRadius: 2 }}>
          <Table size="small" aria-label="Guest list">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: mix(V.text, 4), whiteSpace: "nowrap" } }}>
                <TableCell>Guest</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Party</TableCell>
                <TableCell>RSVP</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Diet</TableCell>
                <TableCell>Table</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                    No guests match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((g) => {
                  const ref = assign[g.id];
                  return (
                    <TableRow key={g.id} hover>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" gap={1.25}>
                          <GuestDot guest={g} size={30} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {g.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "block", md: "none" } }}>
                              {g.party}
                              {g.diet ? <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}> · {g.diet}</Box> : null}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: partyColor(g.party) }} />
                          {g.party}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={rsvpLabel[g.rsvp]}
                          color={rsvpColor[g.rsvp]}
                          variant={g.rsvp === "yes" ? "filled" : "outlined"}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        {g.diet ? (
                          <Chip size="small" color="warning" variant="outlined" label={g.diet} />
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {ref ? (
                          <Chip
                            size="small"
                            component={NextLink}
                            href="/"
                            clickable
                            label={`${tableById[ref.table]?.name ?? ref.table} · seat ${ref.seat + 1}`}
                            aria-label={`${g.name} is at ${tableById[ref.table]?.name}, seat ${ref.seat + 1}. Open the seating plan`}
                          />
                        ) : g.rsvp === "no" ? (
                          <Typography variant="body2" color="text.disabled">
                            Not coming
                          </Typography>
                        ) : (
                          <Chip size="small" variant="outlined" color="warning" label="Not seated" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
