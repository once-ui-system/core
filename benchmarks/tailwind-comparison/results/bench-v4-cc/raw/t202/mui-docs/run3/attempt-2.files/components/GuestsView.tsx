"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
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
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import { guests, tables, type Rsvp } from "@/lib/data";
import { PARTIES, RSVP_LABEL, STANDARD_MEAL, partyColor, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import SeatMenuButton from "./SeatMenuButton";

const DIETS = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort();
const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};
const noPrint = { "@media print": { display: "none" } } as const;

interface MealRow {
  meal: string;
  confirmed: number;
  awaiting: number;
  where: Record<string, number>;
}

export default function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const meals = useMemo<MealRow[]>(() => {
    const map = new Map<string, MealRow>();
    for (const g of guests) {
      if (g.rsvp === "no") continue;
      const meal = g.diet ?? STANDARD_MEAL;
      let row = map.get(meal);
      if (!row) {
        row = { meal, confirmed: 0, awaiting: 0, where: {} };
        map.set(meal, row);
      }
      if (g.rsvp === "yes") row.confirmed += 1;
      else row.awaiting += 1;
      const key = plan.guestTable[g.id] ?? "none";
      row.where[key] = (row.where[key] ?? 0) + 1;
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.meal === STANDARD_MEAL) return -1;
      if (b.meal === STANDARD_MEAL) return 1;
      return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
    });
  }, [plan.guestTable]);

  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);
  const declined = guests.filter((g) => g.rsvp === "no").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (q) {
        const tid = plan.guestTable[g.id];
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tid ? tableById[tid].name : "not seated"}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, party, rsvp, diet, plan.guestTable]);

  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h1" component="h1">
              Guest list
            </Typography>
            <Typography color="text.secondary">
              {guests.length} invited · {plan.confirmed} attending · {totalAwaiting} awaiting a reply · {declined} declined
            </Typography>
          </Box>
          <Button variant="outlined" color="inherit" startIcon={<PrintIcon />} onClick={() => window.print()} sx={noPrint}>
            Print for the caterer
          </Button>
        </Stack>

        <Paper variant="outlined" component="section" aria-labelledby="meals-heading" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography id="meals-heading" variant="h2" component="h2">
            Meals for the caterer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Confirmed guests per meal. Guests who have not replied are counted separately, declined guests are left out. Table
            counts follow the seating plan.
          </Typography>
          <TableContainer>
            <Table size="small" aria-labelledby="meals-heading">
              <TableHead>
                <TableRow>
                  <TableCell>Meal</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell align="right">Awaiting reply</TableCell>
                  <TableCell>Where they sit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((m) => (
                  <TableRow key={m.meal}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {m.meal}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {m.confirmed}
                    </TableCell>
                    <TableCell align="right">{m.awaiting}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                        {tables
                          .filter((t) => m.where[t.id])
                          .map((t) => (
                            <Chip key={t.id} size="small" variant="outlined" label={`${t.name} × ${m.where[t.id]}`} />
                          ))}
                        {m.where.none ? <Chip size="small" color="warning" variant="outlined" label={`Not seated × ${m.where.none}`} /> : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 800 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {totalConfirmed}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {totalAwaiting}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box component="section" aria-labelledby="guests-heading">
          <Typography id="guests-heading" variant="h2" component="h2" sx={{ mb: 1.5 }}>
            All guests
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 1.5, ...noPrint }} role="search" aria-label="Filter guests">
            <TextField
              label="Search guests"
              placeholder="Name, party, diet or table"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flex: 1.4, minWidth: 220 }}
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
            <TextField select label="Party" value={party} onChange={(e) => setParty(e.target.value)} size="small" sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="all">All parties</MenuItem>
              {PARTIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="RSVP" value={rsvp} onChange={(e) => setRsvp(e.target.value)} size="small" sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="all">Any RSVP</MenuItem>
              {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)} size="small" sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="all">Any diet</MenuItem>
              <MenuItem value="none">No dietary needs</MenuItem>
              {DIETS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={clear} disabled={!filtersOn} color="inherit" sx={{ minHeight: 40 }}>
              Clear
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" role="status" sx={{ mb: 1 }}>
            Showing {filtered.length} of {guests.length} guests
          </Typography>
          <Paper variant="outlined">
            <TableContainer>
              <Table size="medium" aria-labelledby="guests-heading" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Guest</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>RSVP</TableCell>
                    <TableCell>Diet</TableCell>
                    <TableCell>Table</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
                        No guests match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((g) => {
                      const tid = plan.guestTable[g.id];
                      return (
                        <TableRow key={g.id} hover>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                            {g.name}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: partyColor(g.party), flexShrink: 0 }} />
                              <span>{g.party}</span>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" color={RSVP_COLOR[g.rsvp]} variant={g.rsvp === "pending" ? "outlined" : "filled"} label={RSVP_LABEL[g.rsvp]} />
                          </TableCell>
                          <TableCell>{g.diet ?? <Typography component="span" color="text.disabled">None</Typography>}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              {tid ? (
                                <Chip size="small" label={tableById[tid].name} />
                              ) : (
                                <Typography component="span" color="text.secondary">
                                  {g.rsvp === "no" ? "Not coming" : "Not seated"}
                                </Typography>
                              )}
                              <Box sx={noPrint}>
                                <SeatMenuButton guestId={g.id} />
                              </Box>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
