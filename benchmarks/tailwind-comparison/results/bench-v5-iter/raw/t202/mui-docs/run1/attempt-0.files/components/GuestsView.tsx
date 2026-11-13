"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Search from "@mui/icons-material/Search";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { event, guests, parties, rsvpLabels, tableById, tables, type Guest, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { DietChip, GuestDot, RsvpChip } from "./GuestBits";

interface Row {
  id: string;
  name: string;
  party: string;
  rsvp: string;
  diet: string;
  table: string;
  guest: Guest;
}

const NO_DIET = "none";
const STANDARD = "Standard menu";
const diets = [...new Set(guests.flatMap((g) => (g.diet ? [g.diet] : [])))].sort();

const columns: GridColDef<Row>[] = [
  {
    field: "name",
    headerName: "Guest",
    flex: 1.3,
    minWidth: 190,
    renderCell: (p) => (
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", height: "100%" }}>
        <GuestDot guest={p.row.guest} size={30} />
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {p.row.name}
        </Typography>
      </Stack>
    ),
  },
  { field: "party", headerName: "Party", flex: 1, minWidth: 140 },
  {
    field: "rsvp",
    headerName: "RSVP",
    minWidth: 140,
    renderCell: (p) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <RsvpChip rsvp={p.row.guest.rsvp} />
      </Box>
    ),
  },
  {
    field: "diet",
    headerName: "Diet",
    flex: 0.8,
    minWidth: 130,
    renderCell: (p) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        {p.row.guest.diet ? (
          <DietChip diet={p.row.guest.diet} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: "table",
    headerName: "Table",
    minWidth: 140,
    renderCell: (p) => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        {p.row.table ? (
          <Chip size="small" variant="outlined" color="primary" label={p.row.table} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {p.row.guest.rsvp === "no" ? "Not coming" : "Not seated"}
          </Typography>
        )}
      </Box>
    ),
  },
];

export default function GuestsView() {
  const { tableOfGuest, seats } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const rows = useMemo<Row[]>(
    () =>
      guests.map((g) => {
        const t = tableOfGuest(g.id);
        return {
          id: g.id,
          name: g.name,
          party: g.party,
          rsvp: rsvpLabels[g.rsvp],
          diet: g.diet ?? "",
          table: t ? (tableById[t]?.name ?? "") : "",
          guest: g,
        };
      }),
    // tableOfGuest is rebuilt whenever the seating changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seats],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !`${r.name} ${r.party} ${r.diet} ${r.table}`.toLowerCase().includes(q)) return false;
      if (party !== "all" && r.party !== party) return false;
      if (rsvp !== "all" && r.guest.rsvp !== rsvp) return false;
      if (diet === NO_DIET && r.guest.diet) return false;
      if (diet !== "all" && diet !== NO_DIET && r.guest.diet !== diet) return false;
      return true;
    });
  }, [rows, query, party, rsvp, diet]);

  const counts = useMemo(() => {
    const c: Record<Rsvp, number> = { yes: 0, maybe: 0, pending: 0, no: 0 };
    for (const g of guests) c[g.rsvp] += 1;
    return c;
  }, []);

  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1680, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, mb: 2.5 }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            {event.name}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, sm: 32 } }}>
            Guest list
          </Typography>
          <Typography color="text.secondary">
            {guests.length} invited: {counts.yes} attending, {counts.maybe} maybe, {counts.pending} no reply yet,{" "}
            {counts.no} declined.
          </Typography>
        </Box>
        <Button component={Link} href="/" variant="contained">
          Back to the seating plan
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
          alignItems: "start",
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "2fr repeat(3, minmax(0, 1fr))" },
              mb: 1.5,
            }}
          >
            <TextField
              size="small"
              label="Search guests"
              placeholder="Name, party, diet or table"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
              <MenuItem value="all">Any reply</MenuItem>
              {(Object.keys(rsvpLabels) as Rsvp[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {rsvpLabels[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
              <MenuItem value="all">Any diet</MenuItem>
              <MenuItem value={NO_DIET}>No dietary need</MenuItem>
              {diets.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary" role="status">
              Showing {filtered.length} of {guests.length} guests
            </Typography>
            {filtersOn && (
              <Button
                size="small"
                onClick={() => {
                  setQuery("");
                  setParty("all");
                  setRsvp("all");
                  setDiet("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </Stack>
          <DataGrid
            rows={filtered}
            columns={columns}
            autoHeight
            rowHeight={54}
            disableRowSelectionOnClick
            disableColumnMenu
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            localeText={{ noRowsLabel: "No guests match these filters" }}
            aria-label="Guest list"
            sx={{ border: 0 }}
          />
        </Paper>

        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <MealCounts />
          <TableDiets />
        </Stack>
      </Box>
    </Box>
  );
}

function mealKey(g: Guest): string {
  return g.diet ?? STANDARD;
}

function MealCounts() {
  const rows = useMemo(() => {
    const names = [STANDARD, ...diets];
    return names.map((meal) => {
      const mine = guests.filter((g) => mealKey(g) === meal);
      const yes = mine.filter((g) => g.rsvp === "yes").length;
      const maybe = mine.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
      return { meal, yes, maybe };
    });
  }, []);
  const totalYes = rows.reduce((n, r) => n + r.yes, 0);
  const totalMaybe = rows.reduce((n, r) => n + r.maybe, 0);
  return (
    <Paper variant="outlined" component="section" aria-labelledby="meals-heading" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Typography variant="h6" component="h2" id="meals-heading">
        Meals for the caterer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Order from the attending column. Maybe and no-reply guests are shown so you can see the most that could come.
      </Typography>
      <TableContainer>
        <Table size="small" aria-label="Count per meal">
          <TableHead>
            <TableRow>
              <TableCell>Meal</TableCell>
              <TableCell align="right">Attending</TableCell>
              <TableCell align="right">Not confirmed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.meal}>
                <TableCell component="th" scope="row">
                  {r.meal}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {r.yes}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", color: "text.secondary" }}>
                  {r.maybe}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell component="th" scope="row" sx={{ fontWeight: 700, borderBottom: 0 }}>
                Total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, borderBottom: 0, fontVariantNumeric: "tabular-nums" }}>
                {totalYes}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, borderBottom: 0, fontVariantNumeric: "tabular-nums" }}>
                {totalMaybe}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function TableDiets() {
  const { seats } = usePlan();
  return (
    <Paper variant="outlined" component="section" aria-labelledby="by-table-heading" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Typography variant="h6" component="h2" id="by-table-heading">
        Dietary needs by table
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        What the kitchen needs to know for each table, from the current plan.
      </Typography>
      <Stack component="ul" spacing={1} sx={{ p: 0, m: 0 }}>
        {tables.map((t) => {
          const row = (seats[t.id] ?? []).flatMap((id) => (id ? [guests.find((g) => g.id === id)] : []));
          const seated = row.length;
          const needs = new Map<string, number>();
          for (const g of row) if (g?.diet) needs.set(g.diet, (needs.get(g.diet) ?? 0) + 1);
          return (
            <Box
              component="li"
              key={t.id}
              sx={{ listStyle: "none", display: "flex", gap: 1.5, alignItems: "baseline", flexWrap: "wrap" }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, width: 84, flex: "none" }}>
                {t.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 56, flex: "none" }}>
                {seated} seated
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, flex: 1 }}>
                {needs.size === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {seated === 0 ? "Empty" : "No dietary needs"}
                  </Typography>
                ) : (
                  [...needs.entries()].map(([d, n]) => (
                    <Chip
                      key={d}
                      size="small"
                      variant="outlined"
                      color={d.toLowerCase().includes("allergy") ? "error" : "warning"}
                      label={`${n} × ${d}`}
                    />
                  ))
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
