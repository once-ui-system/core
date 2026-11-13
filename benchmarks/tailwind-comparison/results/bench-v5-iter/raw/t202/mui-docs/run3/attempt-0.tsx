```tsx app/guests/page.tsx
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
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import AppShell from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Seatwise - seating plan",
  description: "Seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import RoomPlan from "@/components/RoomPlan";
import { RulesSummary, TableDetails, UnseatedList } from "@/components/SidePanel";
import { event, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${event.date}T00:00:00Z`));

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: tone ? `${tone}.main` : "text.primary" }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" component="div">
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export default function PlanPage() {
  const { seatedCount, attendingCount, unseated, capacity, brokenRules, seats } = usePlan();
  const pct = attendingCount ? Math.round((seatedCount / attendingCount) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 1, mb: 2 }}
      >
        <Box>
          <Typography variant="h1" component="h1">
            {event.name}
          </Typography>
          <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", color: "text.secondary", mt: 0.5 }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
              <CalendarMonthIcon fontSize="small" />
              <Typography variant="body2">{dateLabel}</Typography>
            </Stack>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
              <PlaceIcon fontSize="small" />
              <Typography variant="body2">{event.venue}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Box
        component="section"
        aria-label="Seating counts"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Stat
          label="Seated"
          value={
            <>
              {seatedCount}
              <Typography component="span" color="text.secondary" sx={{ fontSize: 16, fontWeight: 500 }}>
                {" "}
                of {attendingCount}
              </Typography>
            </>
          }
          hint={
            <Box sx={{ mt: 0.75 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                aria-label="Share of attending guests seated"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          }
        />
        <Stat
          label="Unseated"
          value={unseated.length}
          tone={unseated.length ? undefined : "success"}
          hint="attending, still need a seat"
        />
        <Stat
          label="Free seats"
          value={capacity - seatedCount}
          hint={`${capacity} seats at ${tables.length} tables`}
        />
        <Stat
          label="Rules broken"
          value={brokenRules.length}
          tone={brokenRules.length ? "error" : "success"}
          hint={brokenRules.length ? "flagged on the plan" : "every rule is kept"}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <RoomPlan />
          <Paper variant="outlined" component="section" aria-label="Guests per table" sx={{ p: 1.5 }}>
            <Stack
              component="ul"
              direction="row"
              sx={{ listStyle: "none", m: 0, p: 0, gap: 1, flexWrap: "wrap" }}
            >
              {tables.map((t) => {
                const n = (seats[t.id] ?? []).filter(Boolean).length;
                return (
                  <Box
                    component="li"
                    key={t.id}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      fontSize: 13,
                    }}
                  >
                    {t.name}: <strong>{n}</strong> of {t.seats}
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Stack>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <TableDetails />
          <UnseatedList />
          <RulesSummary />
        </Stack>
      </Box>
    </Box>
  );
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes (official Next.js App Router setup).
// System font stack: no network font fetch.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5d63", contrastText: "#ffffff" },
        secondary: { main: "#a8612f" },
        error: { main: "#c2362b" },
        warning: { main: "#96590a" },
        success: { main: "#2e7d4f" },
        background: { default: "#f6f4ef", paper: "#ffffff" },
        text: { primary: "#1d2527", secondary: "#58636a" },
        divider: "#dcd8cf",
      },
    },
    dark: {
      palette: {
        primary: { main: "#7cc3c4", contrastText: "#0b1c1e" },
        secondary: { main: "#e0a070" },
        error: { main: "#ff8a7d" },
        warning: { main: "#f2b45c" },
        success: { main: "#6fcf97" },
        background: { default: "#12171a", paper: "#1a2125" },
        text: { primary: "#eceee9", secondary: "#a7b1b4" },
        divider: "#2f3a3f",
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.1rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
  },
});

export default theme;
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import GroupsIcon from "@mui/icons-material/Groups";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { app, planner } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const nav = [
  { href: "/", label: "Plan", icon: <TableRestaurantIcon fontSize="small" /> },
  { href: "/guests", label: "Guests", icon: <GroupsIcon fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { notice, dismissNotice } = usePlan();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: { xs: 0, sm: 2 } }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <EventSeatIcon fontSize="small" />
            </Box>
            <Typography variant="h2" component="span" sx={{ display: { xs: "none", sm: "block" } }}>
              {app.name}
            </Typography>
          </Box>
          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5 }}>
            {nav.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.href}
                  startIcon={n.icon}
                  aria-current={active ? "page" : undefined}
                  color={active ? "primary" : "inherit"}
                  variant={active ? "contained" : "text"}
                  sx={{ minHeight: 40, ...(active ? {} : { color: "text.secondary" }) }}
                >
                  {n.label}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {planner.name}
          </Typography>
          <Avatar
            aria-label={planner.name}
            sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "#fff" }}
          >
            HB
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" sx={{ flex: 1, px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
      <Snackbar
        key={notice?.id}
        open={notice !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") dismissNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice?.severity ?? "info"}
          variant="filled"
          onClose={dismissNotice}
          sx={{ width: "100%" }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```tsx components/DietChip.tsx
import Chip from "@mui/material/Chip";

export default function DietChip({ diet }: { diet: string | null }) {
  if (!diet) return null;
  const critical = diet === "Nut allergy";
  return (
    <Chip
      size="small"
      label={diet}
      color={critical ? "error" : "warning"}
      variant="outlined"
      sx={{ height: 22, fontSize: 12 }}
    />
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useEffect, useState, type CSSProperties, type DragEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  event,
  firstName,
  fixtures,
  guestById,
  partyHue,
  tables,
  type Fixture,
  type TableDef,
} from "@/lib/data";
import { partyEdge, partyTint } from "@/lib/party";
import { usePlan } from "@/lib/plan";
import { LONG_TABLE } from "@/lib/rules";

/** One metre, as a CSS length: the plan is drawn to scale from the room data. */
const m = (v: number) => `calc(var(--m) * ${v})`;

const PILL_W = 1.05;
const PILL_H = 0.58;

interface SeatSpot {
  cx: number;
  cy: number;
}

interface TableGeometry {
  /** Bounding box of the table and its seats, in room metres. */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** Table body, relative to the bounding box. */
  body: { x: number; y: number; w: number; h: number; round: boolean };
  seats: SeatSpot[];
}

function geometry(t: TableDef): TableGeometry {
  if (t.shape === "long") {
    const pad = 0.1;
    const northY = 0.35;
    const bodyY = 0.8;
    const southY = bodyY + LONG_TABLE.h + 0.45;
    const perSide = t.seats / 2;
    const step = LONG_TABLE.w / perSide;
    const seats: SeatSpot[] = [];
    for (let i = 0; i < t.seats; i++) {
      const k = i % perSide;
      seats.push({ cx: pad + step / 2 + k * step, cy: i < perSide ? northY : southY });
    }
    return {
      x0: t.x - pad,
      y0: t.y - bodyY,
      w: LONG_TABLE.w + pad * 2,
      h: southY + 0.45,
      body: { x: pad, y: bodyY, w: LONG_TABLE.w, h: LONG_TABLE.h, round: false },
      seats,
    };
  }
  const R = t.seats > 6 ? 1.45 : 1.3;
  const H = R + 0.62;
  const seats: SeatSpot[] = [];
  for (let i = 0; i < t.seats; i++) {
    const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
    seats.push({ cx: H + R * Math.cos(a), cy: H + R * Math.sin(a) });
  }
  const d = 1.9;
  return {
    x0: t.x - H,
    y0: t.y - H,
    w: H * 2,
    h: H * 2,
    body: { x: H - d / 2, y: H - d / 2, w: d, h: d, round: true },
    seats,
  };
}

const small = (factor: number, min = 9) => `max(${min}px, calc(var(--m) * ${factor}))`;

function FixtureBox({ f }: { f: Fixture }) {
  const base = {
    position: "absolute" as const,
    left: m(f.x),
    top: m(f.y),
    width: m(f.w),
    height: m(f.h),
    display: "grid",
    placeItems: "center",
    textAlign: "center" as const,
    fontSize: small(0.32, 10),
    fontWeight: 600,
    color: "text.secondary",
    overflow: "hidden",
    userSelect: "none" as const,
  };
  if (f.kind === "dancefloor") {
    return (
      <Box
        sx={{
          ...base,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0.5,
          background:
            "repeating-conic-gradient(color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent) 0% 25%, transparent 0% 50%) 0 0 / " +
            `${m(0.8)} ${m(0.8)}`,
        }}
      >
        <Box
          component="span"
          sx={{
            bgcolor: "background.paper",
            px: 1,
            borderRadius: 1,
            lineHeight: 1.5,
          }}
        >
          {f.label}
        </Box>
      </Box>
    );
  }
  if (f.kind === "stage") {
    return (
      <Box
        sx={{
          ...base,
          borderRadius: 1,
          border: "1.5px solid",
          borderColor: "secondary.main",
          bgcolor: "color-mix(in srgb, var(--mui-palette-secondary-main) 22%, var(--mui-palette-background-paper))",
          color: "text.primary",
        }}
      >
        {f.label}
      </Box>
    );
  }
  if (f.kind === "bar") {
    return (
      <Box
        sx={{
          ...base,
          borderRadius: 1,
          border: "1.5px solid",
          borderColor: "warning.main",
          bgcolor: "color-mix(in srgb, var(--mui-palette-warning-main) 20%, var(--mui-palette-background-paper))",
          color: "text.primary",
        }}
      >
        {f.label}
      </Box>
    );
  }
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          left: m(f.x),
          top: m(f.y),
          width: m(f.w),
          height: m(f.h),
          bgcolor: "primary.main",
          borderRadius: 0.5,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: m(f.x + f.w + 0.15),
          top: m(f.y),
          height: m(f.h),
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontSize: small(0.3, 9),
          fontWeight: 600,
          color: "text.secondary",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {f.label}
      </Box>
    </>
  );
}

export default function RoomPlan() {
  const {
    seats,
    flaggedTables,
    flaggedGuests,
    selectedTable,
    heldGuest,
    selectTable,
    hold,
    place,
    unseat,
  } = usePlan();
  const [overTable, setOverTable] = useState<string | null>(null);
  const [overSeat, setOverSeat] = useState<string | null>(null);

  useEffect(() => {
    if (!heldGuest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hold(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heldGuest, hold]);

  const held = heldGuest ? guestById[heldGuest] : null;
  const heldSeated = heldGuest ? Object.values(seats).some((row) => row.includes(heldGuest)) : false;

  const clearDrag = () => {
    setOverTable(null);
    setOverSeat(null);
  };

  const dropOn = (e: DragEvent, tableId: string, seatIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const gid = e.dataTransfer.getData("text/plain");
    clearDrag();
    if (guestById[gid]) place(gid, tableId, seatIndex);
  };

  const containerStyle = {
    containerType: "inline-size",
    "--m": `calc(100cqw / ${event.room_m.width})`,
  } as CSSProperties;
  const roomStyle = {
    aspectRatio: `${event.room_m.width} / ${event.room_m.depth}`,
  } as CSSProperties;

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction="row"
        sx={{ px: 2, py: 1.5, gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography variant="h2" component="h2">
            Room plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.venue} · {event.room_m.width} × {event.room_m.depth} m
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320 }}>
          Drag a guest onto a seat or table, or tap a guest, then tap where they go.
        </Typography>
      </Stack>

      {held ? (
        <Alert
          severity="info"
          icon={false}
          sx={{ borderRadius: 0, alignItems: "center" }}
          action={
            <Stack direction="row" spacing={1}>
              {heldSeated ? (
                <Button size="small" color="inherit" onClick={() => unseat(held.id)}>
                  Unseat
                </Button>
              ) : null}
              <Button size="small" color="inherit" onClick={() => hold(null)}>
                Cancel
              </Button>
            </Stack>
          }
        >
          <strong>{held.name}</strong> is picked up: tap an empty seat, a taken seat to swap, or a table.
        </Alert>
      ) : null}

      <Box
        tabIndex={0}
        role="region"
        aria-label="Room plan. Scrolls sideways on narrow screens."
        sx={{ overflowX: "auto", borderTop: 1, borderColor: "divider" }}
      >
        <Box sx={{ minWidth: 880, p: { xs: 1.5, sm: 2 } }}>
          <Box style={containerStyle}>
            <Box
              style={roomStyle}
              sx={{
                position: "relative",
                width: "100%",
                border: "2px solid",
                borderColor: "text.secondary",
                borderRadius: 1.5,
                bgcolor: "background.default",
                backgroundImage:
                  "linear-gradient(to right, color-mix(in srgb, var(--mui-palette-divider) 55%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--mui-palette-divider) 55%, transparent) 1px, transparent 1px)",
                backgroundSize: `${m(1)} ${m(1)}`,
                overflow: "hidden",
              }}
            >
              {fixtures.map((f) => (
                <FixtureBox key={f.id} f={f} />
              ))}

              {tables.map((t) => {
                const g = geometry(t);
                const row = seats[t.id] ?? [];
                const filled = row.filter(Boolean).length;
                const flags = flaggedTables[t.id] ?? [];
                const flagged = flags.length > 0;
                const selected = selectedTable === t.id;
                const over = overTable === t.id;
                const full = filled >= t.seats;
                return (
                  <Box
                    key={t.id}
                    role="group"
                    aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${flagged ? ", rule broken" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setOverTable(t.id);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setOverTable((cur) => (cur === t.id ? null : cur));
                        setOverSeat(null);
                      }
                    }}
                    onDrop={(e) => dropOn(e, t.id)}
                    sx={{
                      position: "absolute",
                      left: m(g.x0),
                      top: m(g.y0),
                      width: m(g.w),
                      height: m(g.h),
                      borderRadius: t.shape === "round" ? "50%" : 2,
                      bgcolor: over
                        ? "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)"
                        : "transparent",
                      transition: "background-color 120ms",
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => {
                        if (heldGuest) place(heldGuest, t.id);
                        else selectTable(selected ? null : t.id);
                      }}
                      aria-pressed={selected}
                      sx={{
                        position: "absolute",
                        left: m(g.body.x),
                        top: m(g.body.y),
                        width: m(g.body.w),
                        height: m(g.body.h),
                        borderRadius: g.body.round ? "50%" : 1.5,
                        border: "2px solid",
                        borderColor: flagged ? "error.main" : selected ? "primary.main" : "text.secondary",
                        bgcolor: selected
                          ? "color-mix(in srgb, var(--mui-palette-primary-main) 16%, var(--mui-palette-background-paper))"
                          : "background.paper",
                        boxShadow: selected
                          ? "0 0 0 3px color-mix(in srgb, var(--mui-palette-primary-main) 40%, transparent)"
                          : "none",
                        color: "text.primary",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1.15,
                        p: 0,
                        font: "inherit",
                        fontSize: small(0.3, 10),
                        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 2 },
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {t.name}
                      </Box>
                      <Box
                        component="span"
                        sx={{ color: full ? "success.main" : "text.secondary", fontWeight: 600 }}
                      >
                        {filled}/{t.seats}
                      </Box>
                    </Box>

                    {flagged ? (
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          left: m(g.body.x + g.body.w - (g.body.round ? 0.55 : 0.4)),
                          top: m(g.body.y - 0.2),
                          width: m(0.55),
                          height: m(0.55),
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          pointerEvents: "none",
                          "& svg": { width: "70%", height: "70%" },
                        }}
                      >
                        <WarningAmberIcon />
                      </Box>
                    ) : null}

                    {g.seats.map((s, i) => {
                      const gid = row[i] ?? null;
                      const guest = gid ? guestById[gid] : null;
                      const key = `${t.id}:${i}`;
                      const isHeld = gid !== null && gid === heldGuest;
                      const seatFlag = gid ? flaggedGuests.has(gid) : false;
                      const label = guest
                        ? `${firstName(guest.name)}, ${t.name} seat ${i + 1}, ${guest.name}${
                            guest.diet ? `, ${guest.diet}` : ""
                          }${seatFlag ? ", rule broken" : ""}`
                        : `${t.name}, seat ${i + 1}: empty`;
                      return (
                        <Box
                          key={key}
                          component="button"
                          type="button"
                          draggable={guest !== null}
                          title={
                            guest
                              ? `${guest.name} (${guest.party})${guest.diet ? ` · ${guest.diet}` : ""}`
                              : `${t.name}, seat ${i + 1} is free`
                          }
                          aria-label={label}
                          aria-pressed={guest ? isHeld : undefined}
                          onClick={() => {
                            if (heldGuest) place(heldGuest, t.id, i);
                            else if (gid) {
                              hold(gid);
                              selectTable(t.id);
                            } else selectTable(t.id);
                          }}
                          onDragStart={(e) => {
                            if (!gid) return;
                            e.dataTransfer.setData("text/plain", gid);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={clearDrag}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = "move";
                            setOverTable(t.id);
                            setOverSeat(key);
                          }}
                          onDrop={(e) => dropOn(e, t.id, i)}
                          sx={{
                            position: "absolute",
                            left: m(s.cx - PILL_W / 2),
                            top: m(s.cy - PILL_H / 2),
                            width: m(PILL_W),
                            height: m(PILL_H),
                            borderRadius: 99,
                            p: 0,
                            px: "2px",
                            font: "inherit",
                            fontSize: small(0.27, 9),
                            fontWeight: 600,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            overflow: "visible",
                            cursor: guest ? "grab" : "pointer",
                            display: "grid",
                            placeItems: "center",
                            color: guest ? "text.primary" : "text.secondary",
                            border: guest ? "2px solid" : "1.5px dashed",
                            borderColor: seatFlag
                              ? "error.main"
                              : guest
                                ? partyEdge(guest.party)
                                : heldGuest || overSeat === key
                                  ? "primary.main"
                                  : "text.disabled",
                            bgcolor: guest
                              ? partyTint(guest.party)
                              : heldGuest || overSeat === key
                                ? "color-mix(in srgb, var(--mui-palette-primary-main) 18%, var(--mui-palette-background-paper))"
                                : "background.paper",
                            outline: isHeld ? "3px solid var(--mui-palette-primary-main)" : "none",
                            outlineOffset: 1,
                            transform: overSeat === key ? "scale(1.12)" : "none",
                            transition: "transform 100ms",
                            "&:focus-visible": {
                              outline: "3px solid var(--mui-palette-primary-main)",
                              outlineOffset: 1,
                            },
                            ...(guest && guest.diet
                              ? {
                                  "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    right: m(-0.02),
                                    top: m(-0.08),
                                    width: m(0.2),
                                    height: m(0.2),
                                    borderRadius: "50%",
                                    bgcolor: guest.diet === "Nut allergy" ? "error.main" : "warning.main",
                                    border: "1.5px solid var(--mui-palette-background-paper)",
                                  },
                                }
                              : {}),
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {guest ? firstName(guest.name) : heldGuest ? "+" : ""}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>

            <Stack
              direction="row"
              sx={{ mt: 1.5, gap: 2, alignItems: "center", flexWrap: "wrap" }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <Box
                  aria-hidden
                  sx={{
                    width: m(5),
                    height: 6,
                    borderLeft: "2px solid",
                    borderRight: "2px solid",
                    borderBottom: "2px solid",
                    borderColor: "text.secondary",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  5 m
                </Typography>
              </Stack>
              <Stack
                direction="row"
                component="ul"
                aria-label="Party colours"
                sx={{ gap: 1.5, flexWrap: "wrap", listStyle: "none", m: 0, p: 0 }}
              >
                {Object.keys(partyHue).map((p) => (
                  <Stack
                    key={p}
                    component="li"
                    direction="row"
                    sx={{ alignItems: "center", gap: 0.75 }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: partyTint(p, 40),
                        border: "2px solid",
                        borderColor: partyEdge(p),
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {p}
                    </Typography>
                  </Stack>
                ))}
                <Stack component="li" direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                  <Box
                    aria-hidden
                    sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "warning.main" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Dietary need
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DietChip from "./DietChip";
import { guestById, guests, tableById } from "@/lib/data";
import { partyEdge, partyTint } from "@/lib/party";
import { usePlan } from "@/lib/plan";
import { ruleKindLabel, type RuleStatus } from "@/lib/rules";

const statusMeta: Record<RuleStatus, { label: string; color: "success" | "error" | "default"; icon: React.ReactNode }> = {
  ok: { label: "Kept", color: "success", icon: <CheckCircleIcon fontSize="small" color="success" /> },
  broken: { label: "Broken", color: "error", icon: <ErrorIcon fontSize="small" color="error" /> },
  open: { label: "Waiting", color: "default", icon: <HourglassEmptyIcon fontSize="small" color="disabled" /> },
};

function Section({
  title,
  action,
  children,
  id,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
        <Typography variant="h2" component="h2" id={id}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export function UnseatedList() {
  const { unseated, heldGuest, hold, unseat } = usePlan();
  const [over, setOver] = useState(false);
  const waiting = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "no").length;

  return (
    <Section
      id="unseated-title"
      title="Guests to seat"
      action={<Chip size="small" label={unseated.length} color={unseated.length ? "primary" : "success"} />}
    >
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const gid = e.dataTransfer.getData("text/plain");
          if (guestById[gid]) unseat(gid);
        }}
        sx={{
          borderRadius: 1.5,
          outline: over ? "2px dashed var(--mui-palette-primary-main)" : "2px dashed transparent",
          outlineOffset: 2,
        }}
      >
        {unseated.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Everyone attending has a seat.
          </Typography>
        ) : (
          <Stack component="ul" spacing={0.75} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {unseated.map((id) => {
              const g = guestById[id];
              const isHeld = heldGuest === id;
              return (
                <li key={id}>
                  <Box
                    component="button"
                    type="button"
                    draggable
                    aria-pressed={isHeld}
                    onClick={() => hold(isHeld ? null : id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      minHeight: 48,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.5,
                      border: "1.5px solid",
                      borderColor: isHeld ? "primary.main" : "divider",
                      borderLeft: "5px solid",
                      borderLeftColor: partyEdge(g.party),
                      bgcolor: isHeld
                        ? "color-mix(in srgb, var(--mui-palette-primary-main) 14%, var(--mui-palette-background-paper))"
                        : partyTint(g.party, 12),
                      color: "text.primary",
                      font: "inherit",
                      cursor: "grab",
                      "&:hover": { borderColor: "primary.main" },
                      "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 2 },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {g.party}
                      </Typography>
                    </Box>
                    <DietChip diet={g.diet} />
                  </Box>
                </li>
              );
            })}
          </Stack>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5, mb: 0 }}>
        Drop a seated guest here to unseat them. {waiting} guests have not confirmed and {declined} declined; they are
        not listed.
      </Typography>
    </Section>
  );
}

export function RulesSummary() {
  const { rules, brokenRules, selectTable } = usePlan();
  const kept = rules.filter((r) => r.status === "ok").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Section
      id="rules-title"
      title="The couple's rules"
      action={
        <Chip
          size="small"
          color={brokenRules.length ? "error" : "success"}
          label={brokenRules.length ? `${brokenRules.length} broken` : "All kept"}
        />
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} aria-live="polite">
        {brokenRules.length} broken, {kept} kept, {open} waiting for guests to be seated.
      </Typography>
      <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {rules.map((r) => {
          const meta = statusMeta[r.status];
          return (
            <Box
              component="li"
              key={r.index}
              sx={{
                display: "flex",
                gap: 1.25,
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: r.status === "broken" ? "error.main" : "divider",
                bgcolor:
                  r.status === "broken"
                    ? "color-mix(in srgb, var(--mui-palette-error-main) 8%, var(--mui-palette-background-paper))"
                    : "transparent",
              }}
            >
              <Box sx={{ pt: 0.25 }}>{meta.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" component="div">
                  {ruleKindLabel[r.rule.kind]} · <strong>{meta.label}</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  {r.detail}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ fontStyle: "italic" }}>
                  {r.rule.note}
                </Typography>
                {r.status === "broken" && r.tableIds.length > 0 ? (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                    {r.tableIds.map((t) => (
                      <Button key={t} size="small" variant="outlined" color="error" onClick={() => selectTable(t)}>
                        Show {tableById[t].name}
                      </Button>
                    ))}
                  </Stack>
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}

export function TableDetails() {
  const { selectedTable, seats, selectTable, flaggedTables, heldGuest, place, hold, unseat } = usePlan();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTable && ref.current && window.matchMedia("(max-width: 1199px)").matches) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedTable]);

  const table = selectedTable ? tableById[selectedTable] : null;
  if (!table) {
    return (
      <Section id="table-title" title="Table details">
        <Typography variant="body2" color="text.secondary">
          Select a table on the plan to see who sits there and what they can eat.
        </Typography>
      </Section>
    );
  }
  const row = seats[table.id] ?? [];
  const seated = row.filter((x): x is string => x !== null);
  const diets = new Map<string, number>();
  for (const id of seated) {
    const d = guestById[id].diet;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const flags = flaggedTables[table.id] ?? [];

  return (
    <div ref={ref}>
      <Section
        id="table-title"
        title={table.name}
        action={
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Chip size="small" label={`${seated.length} of ${table.seats} seats`} />
            <IconButton size="small" aria-label="Close table details" onClick={() => selectTable(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        {flags.length > 0 ? (
          <Box
            role="alert"
            sx={{
              mb: 1.5,
              p: 1.25,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "error.main",
              bgcolor: "color-mix(in srgb, var(--mui-palette-error-main) 8%, var(--mui-palette-background-paper))",
            }}
          >
            {flags.map((f) => (
              <Typography key={f.index} variant="body2">
                <strong>{ruleKindLabel[f.rule.kind]}:</strong> {f.title}. {f.detail}.
              </Typography>
            ))}
          </Box>
        ) : null}

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
          Dietary needs at this table
        </Typography>
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
          {diets.size === 0 ? (
            <Typography variant="body2">None noted.</Typography>
          ) : (
            Array.from(diets.entries()).map(([d, n]) => (
              <Chip
                key={d}
                size="small"
                color={d === "Nut allergy" ? "error" : "warning"}
                variant="outlined"
                label={`${n} × ${d}`}
              />
            ))
          )}
        </Stack>

        <Stack component="ol" spacing={0.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {row.map((gid, i) => {
            const g = gid ? guestById[gid] : null;
            return (
              <Box
                component="li"
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minHeight: 48,
                  px: 1,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderStyle: g ? "solid" : "dashed",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 18, textAlign: "right" }}>
                  {i + 1}
                </Typography>
                {g ? (
                  <>
                    <Box
                      aria-hidden
                      sx={{ width: 8, alignSelf: "stretch", my: 0.75, borderRadius: 1, bgcolor: partyEdge(g.party) }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div" noWrap>
                        {g.party}
                      </Typography>
                    </Box>
                    <DietChip diet={g.diet} />
                    <IconButton
                      size="small"
                      aria-label={`Unseat ${g.name}`}
                      onClick={() => unseat(g.id)}
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
                    {heldGuest ? (
                      <Button size="small" variant="contained" onClick={() => place(heldGuest, table.id, i)}>
                        Seat {guestById[heldGuest].name.split(" ")[0]}
                      </Button>
                    ) : null}
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
        {heldGuest ? (
          <Button size="small" sx={{ mt: 1 }} onClick={() => hold(null)}>
            Cancel moving {guestById[heldGuest].name}
          </Button>
        ) : null}
      </Section>
    </div>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableDef {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export type RuleKind = "together" | "apart" | "near";

export interface Rule {
  kind: RuleKind;
  guests: string[];
  note: string;
  /** For "near" rules: the fixture kind to be close to and the one to keep away from. */
  target?: FixtureKind;
  avoid?: FixtureKind;
}

export const app = {
  name: "Seatwise",
  tagline: "A seating planner for wedding and event planners",
};

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

export const guests: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
];

export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    target: "door",
    avoid: "stage",
  },
];

export const rsvpLabels: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};

export const parties = Array.from(new Set(guests.map((g) => g.party)));

export const diets = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null)),
).sort();

/** Hue per party, used for the colour coding on seats, chips and the legend. */
export const partyHue: Record<string, number> = {
  Couple: 44,
  "Bride's family": 338,
  "Groom's family": 214,
  "University friends": 152,
  "Work friends": 268,
  "Groom's football club": 24,
  "Plus-ones": 190,
};

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]));

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(name: string): string {
  const parts = name.split(" ");
  // "Avó Rosa Carvalho": the title word is not the first name.
  return parts[0] === "Avó" && parts[1] ? parts[1] : parts[0];
}
```

```ts lib/party.ts
import { partyHue } from "./data";

/** Soft party colour that works over both light and dark surfaces. */
export function partyTint(party: string, pct = 26): string {
  const h = partyHue[party] ?? 0;
  return `color-mix(in srgb, hsl(${h} 70% 50%) ${pct}%, var(--mui-palette-background-paper))`;
}

export function partyEdge(party: string): string {
  const h = partyHue[party] ?? 0;
  return `hsl(${h} 55% 46%)`;
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { guestById, guests, tableById, tables } from "./data";
import { evaluateRules, tableOfGuest, type RuleResult, type Seats } from "./rules";

export interface Notice {
  id: number;
  severity: "success" | "info" | "warning";
  message: string;
}

interface PlanContextValue {
  seats: Seats;
  tableOf: Record<string, string>;
  seatedCount: number;
  attendingCount: number;
  unseated: string[];
  capacity: number;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  selectedTable: string | null;
  heldGuest: string | null;
  notice: Notice | null;
  selectTable: (id: string | null) => void;
  hold: (guestId: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  dismissNotice: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of tables) seats[t.id] = Array<string | null>(t.seats).fill(null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [heldGuest, setHeldGuest] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const say = useCallback((severity: Notice["severity"], message: string) => {
    setNotice({ id: Date.now() + Math.random(), severity, message });
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      const next: Seats = {};
      for (const [k, v] of Object.entries(seats)) next[k] = v.slice();
      let from: { t: string; i: number } | null = null;
      for (const [k, row] of Object.entries(next)) {
        const i = row.indexOf(guestId);
        if (i >= 0) from = { t: k, i };
      }
      const target = next[tableId];
      let idx = seatIndex;

      if (idx !== undefined && target[idx] === guestId) {
        setHeldGuest(null);
        return;
      }
      if (idx !== undefined && target[idx]) {
        const other = guestById[target[idx] as string];
        if (from) {
          next[from.t][from.i] = other.id;
          target[idx] = guestId;
          setSeats(next);
          setSelectedTable(tableId);
          setHeldGuest(null);
          say("success", `Swapped ${guest.name} and ${other.name}`);
          return;
        }
        idx = undefined;
      }
      if (idx === undefined) {
        if (from && from.t === tableId) {
          setSelectedTable(tableId);
          setHeldGuest(null);
          return;
        }
        idx = target.indexOf(null);
      }
      if (idx < 0) {
        say("warning", `${table.name} is full. Unseat someone or choose another table.`);
        return;
      }
      if (from) next[from.t][from.i] = null;
      target[idx] = guestId;
      setSeats(next);
      setSelectedTable(tableId);
      setHeldGuest(null);
      say("success", `${guest.name} is at ${table.name}, seat ${idx + 1}`);
    },
    [seats, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const next: Seats = {};
      let found = false;
      for (const [k, v] of Object.entries(seats)) {
        next[k] = v.map((g) => {
          if (g === guestId) {
            found = true;
            return null;
          }
          return g;
        });
      }
      if (!found) return;
      setSeats(next);
      setHeldGuest(null);
      say("info", `${guestById[guestId].name} is unseated`);
    },
    [seats, say],
  );

  const value = useMemo<PlanContextValue>(() => {
    const tableOf = tableOfGuest(seats);
    const attending = guests.filter((g) => g.rsvp === "yes");
    const results = evaluateRules(seats);
    const broken = results.filter((r) => r.status === "broken");
    const flaggedTables: Record<string, RuleResult[]> = {};
    const flaggedGuests = new Set<string>();
    for (const r of broken) {
      for (const t of r.tableIds) (flaggedTables[t] ??= []).push(r);
      for (const g of r.guestIds) flaggedGuests.add(g);
    }
    return {
      seats,
      tableOf,
      seatedCount: Object.keys(tableOf).length,
      attendingCount: attending.length,
      unseated: attending.filter((g) => !tableOf[g.id]).map((g) => g.id),
      capacity: tables.reduce((n, t) => n + t.seats, 0),
      rules: results,
      brokenRules: broken,
      flaggedTables,
      flaggedGuests,
      selectedTable,
      heldGuest,
      notice,
      selectTable: setSelectedTable,
      hold: setHeldGuest,
      place,
      unseat,
      dismissNotice: () => setNotice(null),
    };
  }, [seats, selectedTable, heldGuest, notice, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/rules.ts
import { fixtures, guestById, rules, tableById, type Rule, type TableDef } from "./data";

export type Seats = Record<string, (string | null)[]>;
export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** Tables to flag when the rule is broken. */
  tableIds: string[];
  /** Guests to flag when the rule is broken. */
  guestIds: string[];
}

export const NEAR_LIMIT_M = 4.5;

/** The long top table, in metres: x and y are its top-left corner. */
export const LONG_TABLE = { w: 4.8, h: 1.1 };

export const ruleKindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export function tableCentre(t: TableDef): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_TABLE.w / 2, y: t.y + LONG_TABLE.h / 2 };
  return { x: t.x, y: t.y };
}

function fixtureCentre(kind: string) {
  const f = fixtures.find((x) => x.kind === kind);
  if (!f) return null;
  return { x: f.x + f.w / 2, y: f.y + f.h / 2, label: f.label };
}

export function tableOfGuest(seats: Seats): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [tid, row] of Object.entries(seats)) {
    for (const gid of row) if (gid) map[gid] = tid;
  }
  return map;
}

function notSeatedReason(gid: string): string {
  const g = guestById[gid];
  if (g.rsvp === "yes") return `${g.name} has no seat yet`;
  if (g.rsvp === "no") return `${g.name} has declined`;
  return `${g.name} has not confirmed (${g.rsvp === "maybe" ? "maybe" : "no reply"})`;
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = tableOfGuest(seats);
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id].name);
    const base = { index, rule, tableIds: [] as string[], guestIds: [] as string[] };

    if (rule.kind === "near") {
      const gid = rule.guests[0];
      const tid = where[gid];
      const title = `${names[0]} near the ${fixtureCentre(rule.target ?? "door")?.label.toLowerCase() ?? "doors"}`;
      if (!tid) return { ...base, title, status: "open", detail: notSeatedReason(gid) };
      const t = tableById[tid];
      const c = tableCentre(t);
      const target = fixtureCentre(rule.target ?? "door");
      const avoid = rule.avoid ? fixtureCentre(rule.avoid) : null;
      if (!target) return { ...base, title, status: "ok", detail: `${t.name}` };
      const dTarget = Math.hypot(c.x - target.x, c.y - target.y);
      const dAvoid = avoid ? Math.hypot(c.x - avoid.x, c.y - avoid.y) : Infinity;
      const dist = `${dTarget.toFixed(1)} m`;
      if (dTarget > NEAR_LIMIT_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is ${dist} from the ${target.label.toLowerCase()} (limit ${NEAR_LIMIT_M} m)`,
          tableIds: [tid],
          guestIds: [gid],
        };
      }
      if (avoid && dAvoid <= dTarget) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is closer to the ${avoid.label.toLowerCase()} than to the ${target.label.toLowerCase()}`,
          tableIds: [tid],
          guestIds: [gid],
        };
      }
      return { ...base, title, status: "ok", detail: `${t.name} is ${dist} from the ${target.label.toLowerCase()}` };
    }

    const [a, b] = rule.guests;
    const title = `${names[0]} & ${names[1]}`;
    const ta = where[a];
    const tb = where[b];
    if (!ta || !tb) {
      const missing = !ta ? a : b;
      return { ...base, title, status: "open", detail: notSeatedReason(missing) };
    }
    if (rule.kind === "together") {
      if (ta === tb) return { ...base, title, status: "ok", detail: `Both at ${tableById[ta].name}` };
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableById[ta].name} and ${tableById[tb].name}`,
        tableIds: [ta, tb],
        guestIds: [a, b],
      };
    }
    if (ta === tb) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `Both at ${tableById[ta].name}`,
        tableIds: [ta],
        guestIds: [a, b],
      };
    }
    return { ...base, title, status: "ok", detail: `${tableById[ta].name} and ${tableById[tb].name}` };
  });
}
```

