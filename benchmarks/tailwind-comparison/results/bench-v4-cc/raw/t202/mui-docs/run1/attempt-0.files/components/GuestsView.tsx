"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Restaurant from "@mui/icons-material/Restaurant";
import Search from "@mui/icons-material/Search";
import {
  DIETS,
  EVENT,
  EVENT_DATE_LABEL,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  TABLES,
  tableById,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

type SortKey = "name" | "party" | "rsvp" | "table";
type Seating = "all" | "seated" | "unseated";

const RSVP_ORDER: Record<Rsvp, number> = { yes: 0, maybe: 1, pending: 2, no: 3 };
const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};

const STANDARD = "Standard menu";
const MEAL_ORDER = ["Vegetarian", "Vegan", "Pescatarian", "Gluten free", "Halal", "Nut allergy", "Soft food", "Children's menu"];
const MEALS: string[] = [
  STANDARD,
  ...MEAL_ORDER.filter((m) => DIETS.includes(m)),
  ...DIETS.filter((d) => !MEAL_ORDER.includes(d)),
];

const mealOf = (g: Guest) => g.diet ?? STANDARD;

// RSVPs do not change in a session, so the caterer's counts are fixed.
const MEAL_ROWS = MEALS.map((meal) => ({
  meal,
  confirmed: GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g) === meal).length,
  possible: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g) === meal).length,
}));
const CONFIRMED_TOTAL = MEAL_ROWS.reduce((n, r) => n + r.confirmed, 0);
const POSSIBLE_TOTAL = MEAL_ROWS.reduce((n, r) => n + r.possible, 0);
const DECLINED = GUESTS.filter((g) => g.rsvp === "no").length;
const DIET_ATTENDING = GUESTS.filter((g) => g.rsvp === "yes" && g.diet).length;

function Summary({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h5" component="p" sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    </Paper>
  );
}

export default function GuestsView() {
  const plan = usePlan();
  const [q, setQ] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState<"all" | Rsvp>("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState<Seating>("all");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const tableName = React.useCallback(
    (g: Guest) => {
      const t = plan.guestTable[g.id];
      return t ? tableById[t].name : "";
    },
    [plan.guestTable],
  );

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      const seated = !!plan.guestTable[g.id];
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tableName(g)} ${RSVP_LABEL[g.rsvp]}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const tableIndex = (g: Guest) => {
      const t = plan.guestTable[g.id];
      return t ? TABLES.findIndex((x) => x.id === t) : 999;
    };
    return list.sort((a, b) => {
      let c = 0;
      if (sort.key === "name") c = a.name.localeCompare(b.name);
      else if (sort.key === "party") c = a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
      else if (sort.key === "rsvp") c = RSVP_ORDER[a.rsvp] - RSVP_ORDER[b.rsvp] || a.name.localeCompare(b.name);
      else c = tableIndex(a) - tableIndex(b) || a.name.localeCompare(b.name);
      return c * dir;
    });
  }, [q, party, rsvp, diet, seating, sort, plan.guestTable, tableName]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const sortBy = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const header = (key: SortKey, label: string) => (
    <TableSortLabel active={sort.key === key} direction={sort.key === key ? sort.dir : "asc"} onClick={() => sortBy(key)}>
      {label}
    </TableSortLabel>
  );
  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  // Meals by table, for the caterer's service plan (guests who are seated, by their current table).
  const byTable = React.useMemo(() => {
    const out = TABLES.map((t) => {
      const guests = plan.state.seats[t.id].filter((id): id is string => id !== null);
      const counts: Record<string, number> = {};
      for (const id of guests) {
        const g = GUESTS.find((x) => x.id === id);
        if (g && g.diet) counts[g.diet] = (counts[g.diet] ?? 0) + 1;
      }
      return { id: t.id, name: t.name, seated: guests.length, counts: Object.entries(counts) };
    });
    return out;
  }, [plan.state.seats]);

  const copySummary = async () => {
    const lines = [
      `${EVENT.name}, ${EVENT_DATE_LABEL}, ${EVENT.venue}`,
      "Meals for the caterer (attending guests)",
      ...MEAL_ROWS.map((r) => `${r.meal}: ${r.confirmed}${r.possible ? ` (+${r.possible} if unconfirmed guests attend)` : ""}`),
      `Total: ${CONFIRMED_TOTAL}${POSSIBLE_TOTAL ? ` (+${POSSIBLE_TOTAL} unconfirmed)` : ""}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      plan.notify("Meal counts copied to the clipboard.", "success");
    } catch {
      plan.notify("Could not copy. Select the meal counts and copy them by hand.", "warning");
    }
  };

  const selectSx = { minWidth: { xs: "100%", sm: 160 }, flex: { sm: "1 1 160px" } };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1680, mx: "auto" }}>
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
        Guest list
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Every guest with their table, and the meals the caterer needs for {EVENT.name}.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          mb: 2,
        }}
      >
        <Summary label="Attending" value={CONFIRMED_TOTAL} caption="confirmed yes" />
        <Summary label="Not confirmed" value={POSSIBLE_TOTAL} caption="maybe or awaiting reply" />
        <Summary label="Declined" value={DECLINED} caption="no seat needed" />
        <Summary label="Dietary needs" value={DIET_ATTENDING} caption="among attending guests" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
        }}
      >
        <Paper variant="outlined" component="section" aria-label="Guests" sx={{ minWidth: 0, overflow: "hidden" }}>
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1.25 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="Name, party, diet or table"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{ flex: "2 1 240px", minWidth: { xs: "100%", sm: 240 } }}
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
              <TextField select size="small" label="Party" value={party} onChange={(e) => setParty(e.target.value)} sx={selectSx} slotProps={{ select: { native: true } }}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="RSVP"
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)}
                sx={selectSx}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Any RSVP</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </TextField>
              <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)} sx={selectSx} slotProps={{ select: { native: true } }}>
                <option value="all">Any diet</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Seating"
                value={seating}
                onChange={(e) => setSeating(e.target.value as Seating)}
                sx={selectSx}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </TextField>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" role="status">
                Showing {rows.length} of {GUESTS.length} guests
              </Typography>
              {filtersOn ? (
                <Button size="small" onClick={clear}>
                  Clear filters
                </Button>
              ) : null}
            </Stack>
          </Box>

          <TableContainer sx={{ maxHeight: { lg: "calc(100dvh - 330px)" } }}>
            <Table size="small" stickyHeader aria-label="Guest list">
              <TableHead>
                <TableRow>
                  <TableCell aria-sort={ariaSort("name")}>{header("name", "Guest")}</TableCell>
                  <TableCell aria-sort={ariaSort("party")} sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {header("party", "Party")}
                  </TableCell>
                  <TableCell aria-sort={ariaSort("rsvp")} sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {header("rsvp", "RSVP")}
                  </TableCell>
                  <TableCell>Diet</TableCell>
                  <TableCell aria-sort={ariaSort("table")}>{header("table", "Table")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((g) => {
                  const c = partyColor(g.party);
                  const t = plan.guestTable[g.id];
                  return (
                    <TableRow key={g.id} hover>
                      <TableCell component="th" scope="row" sx={{ minWidth: 150 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, bgcolor: c.tint, border: `2px solid ${c.solid}` }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {g.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "block", md: "none" } }}>
                              {g.party}
                              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                                {" · "}
                                {RSVP_LABEL[g.rsvp]}
                              </Box>
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{g.party}</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip size="small" variant="outlined" color={RSVP_COLOR[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? <Chip size="small" color="warning" variant="outlined" label={g.diet} /> : <Typography variant="body2" color="text.disabled" aria-label="No dietary need">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        {g.rsvp === "no" ? (
                          <Typography variant="body2" color="text.disabled">
                            Not coming
                          </Typography>
                        ) : (
                          <TextField
                            select
                            size="small"
                            value={t ?? ""}
                            onChange={(e) => (e.target.value ? plan.place(g.id, e.target.value) : plan.unseat(g.id))}
                            slotProps={{ select: { native: true }, htmlInput: { "aria-label": `Table for ${g.name}` } }}
                            sx={{ minWidth: 140 }}
                          >
                            <option value="">Not seated</option>
                            {TABLES.map((tb) => {
                              const free = tb.seats - plan.tableFill[tb.id];
                              return (
                                <option key={tb.id} value={tb.id} disabled={free === 0 && tb.id !== t}>
                                  {tb.name} ({free} free)
                                </option>
                              );
                            })}
                          </TextField>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                        No guests match these filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack
          spacing={2}
          sx={{ position: { lg: "sticky" }, top: { lg: 128 }, maxHeight: { lg: "calc(100dvh - 144px)" }, overflowY: { lg: "auto" } }}
        >
          <Paper variant="outlined" component="section" aria-labelledby="meals-title" sx={{ p: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Restaurant fontSize="small" color="primary" />
                <Typography id="meals-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
                  Meals for the caterer
                </Typography>
              </Stack>
              <Button size="small" startIcon={<ContentCopy fontSize="small" />} onClick={copySummary}>
                Copy
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>
              Confirmed guests, by menu. The last column adds guests who have not replied yet. Select a menu to filter the list.
            </Typography>
            <Table size="small" aria-label="Meal counts">
              <TableHead>
                <TableRow>
                  <TableCell>Menu</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell align="right">If all reply yes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MEAL_ROWS.map((r) => {
                  const key = r.meal === STANDARD ? "none" : r.meal;
                  const active = diet === key;
                  return (
                    <TableRow key={r.meal} selected={active}>
                      <TableCell component="th" scope="row" sx={{ p: 0 }}>
                        <Box
                          component="button"
                          type="button"
                          onClick={() => {
                            setDiet(active ? "all" : key);
                            setRsvp(active ? "all" : "yes");
                          }}
                          aria-pressed={active}
                          sx={{
                            all: "unset",
                            boxSizing: "border-box",
                            width: "100%",
                            cursor: "pointer",
                            px: 2,
                            py: 1.25,
                            fontSize: "0.875rem",
                            fontWeight: active ? 700 : 500,
                            color: "text.primary",
                            "&:hover": { textDecoration: "underline" },
                            "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: -3 },
                          }}
                        >
                          {r.meal}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.confirmed}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {r.confirmed + r.possible}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total meals</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {CONFIRMED_TOTAL}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {CONFIRMED_TOTAL + POSSIBLE_TOTAL}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>

          <Paper variant="outlined" component="section" aria-labelledby="bytable-title" sx={{ p: 1.5 }}>
            <Typography id="bytable-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
              Special meals by table
            </Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>
              Follows the seating plan as it stands now. Everyone else has the standard menu.
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ listStyle: "none", m: 0, p: 0 }}>
              {byTable.map((t) => (
                <Box
                  key={t.id}
                  component="li"
                  sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap", py: 0.5, borderTop: 1, borderColor: tint("text-primary", 10) }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 76 }}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>
                    {t.seated} seated
                  </Typography>
                  {t.counts.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      {t.seated === 0 ? "empty" : "standard only"}
                    </Typography>
                  ) : (
                    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      {t.counts.map(([d, n]) => (
                        <Chip key={d} size="small" color="warning" variant="outlined" label={`${d} × ${n}`} />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
              <Box component="li" sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap", py: 0.5, borderTop: 1, borderColor: tint("text-primary", 10) }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 76 }}>
                  Not seated
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {plan.unseated.length} attending guests still to place
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
