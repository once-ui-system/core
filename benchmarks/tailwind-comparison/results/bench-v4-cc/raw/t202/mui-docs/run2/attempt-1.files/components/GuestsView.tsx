"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import Stack from "@/lib/stack";
import {
  RSVP_LABEL,
  STANDARD_MEAL,
  diets,
  event,
  formatEventDate,
  guests,
  parties,
  partyColor,
  tableById,
  tables,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";

const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};

export default function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q) && !g.party.toLowerCase().includes(q)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "any" && diet !== "none" && g.diet !== diet) return false;
      const seated = plan.assign[g.id] !== null;
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      return true;
    });
  }, [query, party, rsvp, diet, seating, plan.assign]);

  const filtersActive = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const reset = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const meals = React.useMemo(() => {
    const names = [STANDARD_MEAL, ...diets];
    return names.map((meal) => {
      const match = (d: string | null) => (meal === STANDARD_MEAL ? d === null : d === meal);
      return {
        meal,
        attending: guests.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
        unconfirmed: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
      };
    });
  }, []);
  const totalAttending = meals.reduce((n, m) => n + m.attending, 0);
  const totalUnconfirmed = meals.reduce((n, m) => n + m.unconfirmed, 0);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={1.5}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Guest list
          </Typography>
          <Typography color="text.secondary">
            {event.name} · {formatEventDate(event.date)} · {guests.length} invited, {totalAttending} attending
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ minHeight: 44, displayPrint: "none" }}>
          Print for the caterer
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
          alignItems: "start",
        }}
      >
        <Paper variant="outlined" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" },
              displayPrint: "none",
            }}
          >
            <TextField
              type="search"
              size="small"
              label="Search guests"
              placeholder="Name or party"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
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
              {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
              <MenuItem value="all">Any diet</MenuItem>
              <MenuItem value="any">Has a dietary need</MenuItem>
              <MenuItem value="none">No dietary need</MenuItem>
              {diets.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Seating" value={seating} onChange={(e) => setSeating(e.target.value)}>
              <MenuItem value="all">Seated or not</MenuItem>
              <MenuItem value="seated">Seated</MenuItem>
              <MenuItem value="unseated">Not seated</MenuItem>
            </TextField>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1.5, pb: 1, minHeight: 36 }}
          >
            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
              Showing {filtered.length} of {guests.length} guests
            </Typography>
            {filtersActive ? (
              <Button size="small" onClick={reset} sx={{ displayPrint: "none" }}>
                Clear filters
              </Button>
            ) : null}
          </Stack>
          <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
            <Table size="small" aria-label="Guest list">
              <TableHead>
                <TableRow>
                  <TableCell>Guest</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Party</TableCell>
                  <TableCell>RSVP</TableCell>
                  <TableCell>Meal</TableCell>
                  <TableCell>Table</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((g) => {
                  const ref = plan.assign[g.id];
                  return (
                    <TableRow key={g.id} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: partyColor(g.party), flexShrink: 0 }} />
                          <Box>
                            {g.name}
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ display: { xs: "block", sm: "none" }, fontWeight: 400 }}>
                              {g.party}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{g.party}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" color={RSVP_COLOR[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? <Chip size="small" color="warning" variant="outlined" label={g.diet} /> : <Typography variant="body2" color="text.secondary">{STANDARD_MEAL}</Typography>}
                      </TableCell>
                      <TableCell>
                        {ref ? (
                          <Typography variant="body2">
                            {tableById[ref.tableId].name}
                            <Typography component="span" variant="caption" color="text.secondary">
                              {" "}
                              · seat {ref.seat + 1}
                            </Typography>
                          </Typography>
                        ) : g.rsvp === "no" ? (
                          <Typography variant="body2" color="text.secondary">
                            Not needed
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                            Not seated
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" aria-label="Meal counts for the caterer" sx={{ p: 1.5 }}>
            <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
              Meals for the caterer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Attending guests only. Maybe and pending replies are counted apart.
            </Typography>
            <TableContainer>
              <Table size="small" aria-label="Meal counts">
                <TableHead>
                  <TableRow>
                    <TableCell>Meal</TableCell>
                    <TableCell align="right">Attending</TableCell>
                    <TableCell align="right">Unconfirmed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meals.map((m) => (
                    <TableRow key={m.meal}>
                      <TableCell component="th" scope="row">
                        {m.meal}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {m.attending}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {m.unconfirmed}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 800, borderBottom: 0 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, borderBottom: 0 }}>
                      {totalAttending}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", borderBottom: 0 }}>
                      {totalUnconfirmed}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" component="section" aria-label="Dietary needs by table" sx={{ p: 1.5 }}>
            <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>
              Dietary needs by table
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
              {tables.map((t) => {
                const seated = plan.occupants(t.id).filter((g) => g !== null);
                const needs: Record<string, number> = {};
                for (const g of seated) if (g && g.diet) needs[g.diet] = (needs[g.diet] ?? 0) + 1;
                return (
                  <Box component="li" key={t.id} sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 84 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 52 }}>
                      {seated.length} guests
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {Object.keys(needs).length === 0
                        ? "No dietary needs"
                        : Object.entries(needs)
                            .map(([d, n]) => `${d} × ${n}`)
                            .join(", ")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}
