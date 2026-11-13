"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import DietChip from "@/components/DietChip";
import { diets, guests, parties, rsvpLabels, tables, type Guest, type Rsvp } from "@/lib/data";
import { partyEdge } from "@/lib/party";
import { usePlan } from "@/lib/plan";

const rsvpColor: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};

const STANDARD = "Standard menu";

const cols = {
  md: "minmax(180px, 2fr) minmax(160px, 1.5fr) 120px minmax(130px, 1fr) 180px",
};

function RsvpChip({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Chip
      size="small"
      label={rsvpLabels[rsvp]}
      color={rsvpColor[rsvp]}
      variant={rsvp === "yes" ? "filled" : "outlined"}
      sx={{ height: 24 }}
    />
  );
}

export default function GuestsPage() {
  const { tableOf, seats, place, unseat } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" ? g.diet !== null : diet !== "all" && g.diet !== diet) return false;
      if (seating === "seated" && !tableOf[g.id]) return false;
      if (seating === "unseated" && tableOf[g.id]) return false;
      return true;
    });
  }, [q, party, rsvp, diet, seating, tableOf]);

  const meals = useMemo(() => {
    const rows = [STANDARD, ...diets].map((meal) => {
      const of = (g: Guest) => (g.diet ?? STANDARD) === meal;
      return {
        meal,
        confirmed: guests.filter((g) => g.rsvp === "yes" && of(g)).length,
        possible: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && of(g)).length,
      };
    });
    return {
      rows,
      confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
      possible: rows.reduce((n, r) => n + r.possible, 0),
    };
  }, []);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const field = { size: "small" as const, fullWidth: true };

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      <Typography variant="h1" component="h1">
        Guest list
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        {guests.length} invited · {meals.confirmed} attending · {meals.possible} not yet confirmed
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 360px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0 }}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }} component="section" aria-label="Filters">
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "minmax(220px, 1.4fr) repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              <TextField
                {...field}
                label="Search guests"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
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
              <TextField
                {...field}
                select
                label="Party"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">All parties</option>
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </TextField>
              <TextField
                {...field}
                select
                label="RSVP"
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value)}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Any RSVP</option>
                {(Object.keys(rsvpLabels) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {rsvpLabels[r]}
                  </option>
                ))}
              </TextField>
              <TextField
                {...field}
                select
                label="Diet"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Any diet</option>
                <option value="none">No dietary need</option>
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </TextField>
              <TextField
                {...field}
                select
                label="Seating"
                value={seating}
                onChange={(e) => setSeating(e.target.value)}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </TextField>
            </Box>
            <Stack direction="row" sx={{ mt: 1.5, alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" color="text.secondary" aria-live="polite" role="status">
                Showing {filtered.length} of {guests.length} guests
              </Typography>
              <Button size="small" onClick={clear} disabled={!filtersActive}>
                Clear filters
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box role="table" aria-label="Guests" aria-rowcount={filtered.length + 1}>
              <Box
                role="row"
                sx={{
                  display: { xs: "none", md: "grid" },
                  gridTemplateColumns: cols.md,
                  gap: 2,
                  px: 2,
                  py: 1.25,
                  bgcolor: "action.hover",
                  borderBottom: 1,
                  borderColor: "divider",
                  color: "text.secondary",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Box role="columnheader">Guest</Box>
                <Box role="columnheader">Party</Box>
                <Box role="columnheader">RSVP</Box>
                <Box role="columnheader">Diet</Box>
                <Box role="columnheader">Table</Box>
              </Box>
              <Box role="rowgroup">
                {filtered.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography>No guest matches these filters.</Typography>
                    <Button sx={{ mt: 1 }} onClick={clear}>
                      Clear filters
                    </Button>
                  </Box>
                ) : null}
                {filtered.map((g) => {
                  const tid = tableOf[g.id] ?? "";
                  const attending = g.rsvp === "yes";
                  return (
                    <Box
                      role="row"
                      key={g.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr) auto", md: cols.md },
                        gridTemplateAreas: {
                          xs: `"name rsvp" "party party" "diet diet" "table table"`,
                          md: "none",
                        },
                        alignItems: "center",
                        columnGap: 2,
                        rowGap: 0.75,
                        px: 2,
                        py: { xs: 1.5, md: 1 },
                        minHeight: { md: 56 },
                        borderBottom: 1,
                        borderColor: "divider",
                        borderLeft: "4px solid",
                        borderLeftColor: partyEdge(g.party),
                        "&:last-of-type": { borderBottom: 0 },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Box role="cell" sx={{ gridArea: { xs: "name", md: "auto" }, fontWeight: 600, minWidth: 0 }}>
                        {g.name}
                      </Box>
                      <Box
                        role="cell"
                        sx={{ gridArea: { xs: "party", md: "auto" }, color: "text.secondary", fontSize: 14 }}
                      >
                        {g.party}
                      </Box>
                      <Box role="cell" sx={{ gridArea: { xs: "rsvp", md: "auto" } }}>
                        <RsvpChip rsvp={g.rsvp} />
                      </Box>
                      <Box role="cell" sx={{ gridArea: { xs: "diet", md: "auto" }, minHeight: { xs: 0, md: 24 } }}>
                        {g.diet ? (
                          <DietChip diet={g.diet} />
                        ) : (
                          <Typography variant="body2" color="text.disabled" component="span">
                            {"—"}
                          </Typography>
                        )}
                      </Box>
                      <Box role="cell" sx={{ gridArea: { xs: "table", md: "auto" } }}>
                        {attending ? (
                          <TextField
                            size="small"
                            select
                            fullWidth
                            value={tid}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") unseat(g.id);
                              else place(g.id, v);
                            }}
                            slotProps={{
                              select: { native: true },
                              htmlInput: { "aria-label": `Table for ${g.name}` },
                            }}
                          >
                            <option value="">Not seated</option>
                            {tables.map((t) => {
                              const used = (seats[t.id] ?? []).filter(Boolean).length;
                              const full = used >= t.seats && t.id !== tid;
                              return (
                                <option key={t.id} value={t.id} disabled={full}>
                                  {t.name} ({used}/{t.seats})
                                </option>
                              );
                            })}
                          </TextField>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not seated (no confirmed RSVP)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Paper
          component="section"
          aria-labelledby="meals-title"
          variant="outlined"
          sx={{ p: 2, order: { xs: 1, lg: 2 }, position: { lg: "sticky" }, top: { lg: 80 } }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.5 }}>
            <RestaurantIcon fontSize="small" color="primary" />
            <Typography variant="h2" component="h2" id="meals-title">
              Meals for the caterer
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Confirmed guests per meal. Maybe and no-reply guests are counted separately. Select a meal to filter the
            list.
          </Typography>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <Box component="thead">
              <Box component="tr" sx={{ color: "text.secondary", fontSize: 12 }}>
                <Box component="th" scope="col" sx={{ textAlign: "left", py: 0.75, fontWeight: 700 }}>
                  Meal
                </Box>
                <Box component="th" scope="col" sx={{ textAlign: "right", py: 0.75, fontWeight: 700 }}>
                  Confirmed
                </Box>
                <Box component="th" scope="col" sx={{ textAlign: "right", py: 0.75, fontWeight: 700 }}>
                  Not yet
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {meals.rows.map((r) => {
                const value = r.meal === STANDARD ? "none" : r.meal;
                return (
                  <Box component="tr" key={r.meal} sx={{ borderTop: 1, borderColor: "divider" }}>
                    <Box component="th" scope="row" sx={{ textAlign: "left", fontWeight: 500, py: 0.25 }}>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => setDiet(diet === value ? "all" : value)}
                        aria-pressed={diet === value}
                        sx={{ justifyContent: "flex-start", minHeight: 36, fontWeight: diet === value ? 700 : 500 }}
                      >
                        {r.meal}
                      </Button>
                    </Box>
                    <Box component="td" sx={{ textAlign: "right", fontWeight: 700, fontSize: 16 }}>
                      {r.confirmed}
                    </Box>
                    <Box component="td" sx={{ textAlign: "right", color: "text.secondary" }}>
                      {r.possible}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box component="tfoot">
              <Box component="tr" sx={{ borderTop: 2, borderColor: "text.secondary" }}>
                <Box component="th" scope="row" sx={{ textAlign: "left", py: 1, fontWeight: 700 }}>
                  Total
                </Box>
                <Box component="td" sx={{ textAlign: "right", fontWeight: 700, fontSize: 16 }}>
                  {meals.confirmed}
                </Box>
                <Box component="td" sx={{ textAlign: "right", color: "text.secondary" }}>
                  {meals.possible}
                </Box>
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5, mb: 0 }}>
            {guests.filter((g) => g.rsvp === "no").length} declined and is not counted.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
