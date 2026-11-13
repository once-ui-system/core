```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list | Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/components/PlanProvider";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "Seating planner for wedding and event planners.",
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
import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = { title: "Seating plan | Seatwise" };

export default function Page() {
  return <PlanView />;
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes (official Next.js App Router setup).
// System font stack: nothing is fetched from the network.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5e50", dark: "#1f4a3e", light: "#4f8472", contrastText: "#ffffff" },
        secondary: { main: "#9a4b32" },
        error: { main: "#c0332b" },
        warning: { main: "#b26a00" },
        success: { main: "#1f7a4d" },
        background: { default: "#f4f1ea", paper: "#ffffff" },
        text: { primary: "#1d2420", secondary: "#55605a" },
        divider: "#e0dbd0",
      },
    },
    dark: {
      palette: {
        primary: { main: "#86c9b1", dark: "#5fa68c", light: "#a9dcc9", contrastText: "#0d1a15" },
        secondary: { main: "#e0957a" },
        error: { main: "#ff8a80" },
        warning: { main: "#f2b04c" },
        success: { main: "#6fd3a1" },
        background: { default: "#12161a", paper: "#1b2026" },
        text: { primary: "#e9ece9", secondary: "#a4aea8" },
        divider: "#2c343b",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTab: { styleOverrides: { root: { minHeight: 48 } } },
  },
});

export default theme;
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import TableRestaurant from "@mui/icons-material/TableRestaurant";
import { planner } from "@/lib/data";
import { initials } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      aria-label="Switch between light and dark colour scheme"
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      color="inherit"
    >
      <Box
        component="span"
        sx={(theme) => ({ display: "inline-flex", ...theme.applyStyles("dark", { display: "none" }) })}
      >
        <DarkModeOutlined />
      </Box>
      <Box
        component="span"
        sx={(theme) => ({ display: "none", ...theme.applyStyles("dark", { display: "inline-flex" }) })}
      >
        <LightModeOutlined />
      </Box>
    </IconButton>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/guests") ? "/guests" : "/";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", backgroundImage: "none" }}
      >
        <Toolbar sx={{ flexWrap: "wrap", gap: 1, px: { xs: 2, md: 3 }, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            component={NextLink}
            href="/"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none", mr: { md: 3 } }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TableRestaurant fontSize="small" />
            </Box>
            <Typography component="span" sx={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" }}>
              Seatwise
            </Typography>
          </Box>

          <Tabs
            value={current}
            aria-label="Main"
            sx={{
              order: { xs: 3, sm: 0 },
              width: { xs: "100%", sm: "auto" },
              flexGrow: { sm: 1 },
              minHeight: 48,
              "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            }}
          >
            {NAV.map((n) => (
              <Tab
                key={n.href}
                component={NextLink}
                href={n.href}
                value={n.href}
                label={n.label}
                aria-current={current === n.href ? "page" : undefined}
              />
            ))}
          </Tabs>

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />
          <ModeToggle />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pl: 0.5 }}>
            <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right", lineHeight: 1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {planner.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wedding planner
              </Typography>
            </Box>
            <Avatar
              alt={planner.name}
              sx={{ width: 34, height: 34, bgcolor: "secondary.main", color: "secondary.contrastText", fontSize: 14, fontWeight: 700 }}
            >
              {initials(planner.name)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        id="main"
        sx={{ flexGrow: 1, width: "100%", maxWidth: 1680, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}
      >
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/GuestsView.tsx
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
```

```tsx components/PlanProvider.tsx
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import {
  type Assign,
  type RuleResult,
  type Stats,
  computeStats,
  evaluateRules,
  firstFreeSeat,
  firstName,
  guestById,
  initialAssign,
  seatsByTable,
  tableById,
} from "@/lib/plan";

interface Toast {
  key: number;
  text: string;
  undo: boolean;
}

interface PlanContextValue {
  assign: Assign;
  seats: Record<string, (string | null)[]>;
  stats: Stats;
  rules: RuleResult[];
  brokenTables: Set<string>;
  flaggedGuests: Set<string>;
  holding: string | null;
  setHolding: (id: string | null) => void;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  focusGuest: string | null;
  setFocusGuest: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  moveGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  place: (tableId: string, seat?: number) => void;
  undo: () => void;
  canUndo: boolean;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const v = React.useContext(PlanContext);
  if (!v) throw new Error("usePlan must be used inside PlanProvider");
  return v;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assign>(() => initialAssign());
  const [history, setHistory] = React.useState<Assign[]>([]);
  const [holding, setHolding] = React.useState<string | null>(null);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [focusGuest, setFocusGuest] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<Toast | null>(null);
  const [toastOpen, setToastOpen] = React.useState(false);

  const say = React.useCallback((text: string, undo: boolean) => {
    setToast({ key: Date.now(), text, undo });
    setToastOpen(true);
  }, []);

  const seats = React.useMemo(() => seatsByTable(assign), [assign]);
  const stats = React.useMemo(() => computeStats(assign), [assign]);
  const rules = React.useMemo(() => evaluateRules(assign), [assign]);
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of rules) if (r.status === "broken") r.tables.forEach((t) => s.add(t));
    return s;
  }, [rules]);
  const flaggedGuests = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of rules) if (r.status === "broken") r.guestIds.forEach((g) => s.add(g));
    return s;
  }, [rules]);

  const moveGuest = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return false;
      const row = seats[tableId];
      if (!row) return false;
      const current = assign[guestId] ?? null;

      let target = seat;
      if (target === undefined) {
        if (current?.table === tableId) {
          say(`${firstName(guest.name)} is already at ${table.name}`, false);
          return false;
        }
        target = firstFreeSeat(row, guestId);
        if (target < 0) {
          say(`${table.name} is full. Unseat someone or pick another table.`, false);
          return false;
        }
      }
      if (current && current.table === tableId && current.seat === target) return false;

      const occupantId = row[target] ?? null;
      const next: Assign = { ...assign };
      let text: string;
      if (occupantId && occupantId !== guestId) {
        next[occupantId] = current;
        const other = guestById[occupantId];
        text = current
          ? `${firstName(guest.name)} and ${firstName(other?.name ?? "guest")} swapped seats`
          : `${firstName(guest.name)} seated at ${table.name}, ${firstName(other?.name ?? "guest")} now needs a seat`;
      } else if (current && current.table !== tableId) {
        text = `${firstName(guest.name)} moved to ${table.name}, seat ${target + 1}`;
      } else if (current) {
        text = `${firstName(guest.name)} moved to seat ${target + 1}`;
      } else {
        text = `${firstName(guest.name)} seated at ${table.name}, seat ${target + 1}`;
      }
      next[guestId] = { table: tableId, seat: target };
      setHistory((h) => [...h.slice(-19), assign]);
      setAssign(next);
      say(text, true);
      return true;
    },
    [assign, seats, say],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      if (!guest || !assign[guestId]) return;
      setHistory((h) => [...h.slice(-19), assign]);
      setAssign({ ...assign, [guestId]: null });
      say(`${firstName(guest.name)} unseated`, true);
    },
    [assign, say],
  );

  const place = React.useCallback(
    (tableId: string, seat?: number) => {
      if (!holding) return;
      const ok = moveGuest(holding, tableId, seat);
      if (ok) {
        setHolding(null);
        setSelectedTable(tableId);
      }
    },
    [holding, moveGuest],
  );

  const undo = React.useCallback(() => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setAssign(prev);
    setHistory(history.slice(0, -1));
    setToastOpen(false);
  }, [history]);

  React.useEffect(() => {
    if (!holding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHolding(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [holding]);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      seats,
      stats,
      rules,
      brokenTables,
      flaggedGuests,
      holding,
      setHolding,
      selectedTable,
      selectTable: setSelectedTable,
      focusGuest,
      setFocusGuest,
      dragId,
      setDragId,
      moveGuest,
      unseat,
      place,
      undo,
      canUndo: history.length > 0,
    }),
    [assign, seats, stats, rules, brokenTables, flaggedGuests, holding, selectedTable, focusGuest, dragId, moveGuest, unseat, place, undo, history.length],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toastOpen}
        autoHideDuration={4500}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToastOpen(false);
        }}
        message={toast?.text}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          toast?.undo ? (
            <Button color="inherit" size="small" onClick={undo} sx={{ fontWeight: 700 }}>
              Undo
            </Button>
          ) : undefined
        }
      />
    </PlanContext.Provider>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "./Stack";
import Typography from "@mui/material/Typography";
import { event, tables } from "@/lib/data";
import { formatDate, totalSeats } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesCard, TableDetail, TablesCard } from "./Sidebar";
import { UnseatedTray } from "./UnseatedTray";
import { V } from "./ui";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  tone?: "error" | "warning" | "success";
}) {
  const color = tone === "error" ? V.error : tone === "warning" ? V.warning : tone === "success" ? V.success : V.text;
  return (
    <Card sx={{ px: 2, py: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography component="p" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {sub}
      </Typography>
    </Card>
  );
}

export function PlanView() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Stack gap={2.5}>
      <Box>
        <Typography variant="h1" component="h1">
          {event.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {formatDate(event.date)} · {event.venue} · {tables.length} tables, {totalSeats} seats
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        <Stat
          label="Seated"
          value={stats.seatedAttending}
          sub={`of ${stats.attending} attending${stats.seatedOther ? ` · +${stats.seatedOther} unconfirmed` : ""}`}
          tone="success"
        />
        <Stat
          label="Unseated"
          value={stats.unseated}
          sub={stats.unseated ? "attending, need a seat" : "everyone is placed"}
          tone={stats.unseated ? "warning" : "success"}
        />
        <Stat label="Empty seats" value={stats.emptySeats} sub={`of ${totalSeats} across ${tables.length} tables`} />
        <Stat
          label="Rules"
          value={broken}
          sub={broken ? `broken of ${rules.length}` : `none broken of ${rules.length}`}
          tone={broken ? "error" : "success"}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
        }}
      >
        <Stack gap={2.5} sx={{ minWidth: 0 }}>
          <UnseatedTray />
          <RoomPlan />
        </Stack>
        <Stack gap={2.5} sx={{ minWidth: 0 }}>
          <RulesCard />
          <TableDetail />
          <TablesCard />
        </Stack>
      </Box>
    </Stack>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Stack from "./Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LocalBar from "@mui/icons-material/LocalBar";
import MusicNote from "@mui/icons-material/MusicNote";
import Undo from "@mui/icons-material/Undo";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { event, fixtures, tables } from "@/lib/data";
import type { Fixture, TableDef } from "@/lib/data";
import {
  SEAT_D,
  firstName,
  guestById,
  initials,
  layoutOf,
  parties,
  partyColor,
  partyText,
  tableById,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { SrOnly } from "./SrOnly";
import { V, mix } from "./ui";

const ROOM_W = event.room_m.width;
const ROOM_D = event.room_m.depth;
const MIN_SCALE = 30;
const MAX_SCALE = 64;

/* ---------- fixtures ---------- */

function FixtureNode({ f, scale }: { f: Fixture; scale: number }) {
  const base = {
    position: "absolute" as const,
    left: f.x * scale,
    top: f.y * scale,
    width: f.w * scale,
    height: f.h * scale,
  };
  if (f.kind === "door") {
    return (
      <Box
        role="img"
        aria-label={`${f.label}, on the left wall`}
        sx={{
          ...base,
          bgcolor: V.success,
          color: V.white,
          borderRadius: "0 4px 4px 0",
          boxShadow: `0 0 0 2px ${mix(V.success, 30)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontSize: 10,
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {f.label}
      </Box>
    );
  }
  const common = {
    ...base,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 0.25,
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center" as const,
    overflow: "hidden",
  };
  if (f.kind === "stage") {
    return (
      <Box
        role="img"
        aria-label={`${f.label}, stage`}
        sx={{ ...common, borderRadius: 1.5, bgcolor: V.stage, color: V.white, boxShadow: `inset 0 -4px 0 ${mix(V.text, 25)}` }}
      >
        <MusicNote sx={{ fontSize: 18 }} />
        {f.label}
      </Box>
    );
  }
  if (f.kind === "bar") {
    return (
      <Box
        role="img"
        aria-label={`${f.label}`}
        sx={{ ...common, borderRadius: 1.5, bgcolor: V.bar, color: V.barText, boxShadow: `inset 0 0 0 3px ${mix(V.barText, 25)}` }}
      >
        <LocalBar sx={{ fontSize: 20 }} />
        {f.label}
      </Box>
    );
  }
  return (
    <Box
      role="img"
      aria-label={`${f.label}`}
      sx={{
        ...common,
        borderRadius: 1,
        color: V.text2,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontSize: 11,
        backgroundImage: `repeating-conic-gradient(${mix(V.primary, 16)} 0% 25%, ${mix(V.primary, 5)} 0% 50%)`,
        backgroundSize: `${scale}px ${scale}px`,
        boxShadow: `inset 0 0 0 1.5px ${mix(V.primary, 35)}`,
      }}
    >
      {f.label}
    </Box>
  );
}

/* ---------- seats ---------- */

interface SeatProps {
  table: TableDef;
  index: number;
  guestId: string | null;
  x: number;
  y: number;
  scale: number;
  over: string | null;
  setOver: (k: string | null) => void;
}

function Seat({ table, index, guestId, x, y, scale, over, setOver }: SeatProps) {
  const { holding, setHolding, dragId, setDragId, place, selectTable, setFocusGuest, moveGuest, flaggedGuests } =
    usePlan();
  const guest = guestId ? guestById[guestId] : null;
  const size = SEAT_D * scale;
  const showName = size >= 30;
  const key = `${table.id}:${index}`;
  const isOver = over === key;
  const flagged = guestId ? flaggedGuests.has(guestId) : false;
  const isHeld = guestId !== null && holding === guestId;

  const label = guest
    ? `${table.name}, seat ${index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", a seating rule is broken" : ""}`
    : `${table.name}, seat ${index + 1}: empty`;

  const onClick = () => {
    if (holding) {
      if (holding === guestId) setHolding(null);
      else place(table.id, index);
      return;
    }
    selectTable(table.id);
    setFocusGuest(guestId);
  };

  return (
    <ButtonBase
      title={guest ? `${guest.name}${guest.diet ? ` · ${guest.diet}` : ""}` : `Seat ${index + 1}, empty`}
      onClick={onClick}
      draggable={guest !== null}
      onDragStart={(e) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guestId);
      }}
      onDragEnd={() => {
        setDragId(null);
        setOver(null);
      }}
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (over !== key) setOver(key);
      }}
      onDrop={(e) => {
        if (!dragId) return;
        e.preventDefault();
        e.stopPropagation();
        moveGuest(dragId, table.id, index);
        setDragId(null);
        setOver(null);
      }}
      sx={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        fontSize: size >= 30 ? 9.5 : 9,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        overflow: "visible",
        transition: "transform 120ms, box-shadow 120ms",
        ...(guest
          ? {
              bgcolor: partyColor(guest.party),
              color: partyText(guest.party),
              border: `2px solid ${mix(partyText(guest.party), 70)}`,
              cursor: "grab",
            }
          : {
              bgcolor: holding || dragId ? mix(V.primary, 14) : "transparent",
              color: V.text2,
              border: `1.5px dashed ${holding || dragId ? V.primary : V.text2}`,
            }),
        ...(isHeld ? { boxShadow: `0 0 0 3px ${V.paper}, 0 0 0 6px ${V.primary}` } : {}),
        ...(flagged ? { boxShadow: `0 0 0 2px ${V.paper}, 0 0 0 4.5px ${V.error}` } : {}),
        ...(isOver ? { transform: "scale(1.2)", boxShadow: `0 0 0 3px ${V.paper}, 0 0 0 6px ${V.primary}` } : {}),
        "&:hover": { transform: "scale(1.1)" },
        "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 3 },
      }}
    >
      <SrOnly>{label}</SrOnly>
      {guest ? (
        <>
          <Box
            aria-hidden
            component="span"
            sx={{ maxWidth: size - 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {showName ? firstName(guest.name) : initials(guest.name)}
          </Box>
          {guest.diet ? (
            <Box
              aria-hidden
              component="span"
              sx={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: V.text,
                border: `1.5px solid ${V.paper}`,
              }}
            />
          ) : null}
        </>
      ) : (
        <Box component="span" aria-hidden sx={{ fontSize: 10, opacity: 0.8 }}>
          {index + 1}
        </Box>
      )}
    </ButtonBase>
  );
}

/* ---------- tables ---------- */

function TableNode({
  table,
  scale,
  over,
  setOver,
}: {
  table: TableDef;
  scale: number;
  over: string | null;
  setOver: (k: string | null) => void;
}) {
  const { seats, holding, dragId, setDragId, place, selectTable, selectedTable, brokenTables, moveGuest } = usePlan();
  const layout = layoutOf(table.id);
  const row = seats[table.id] ?? [];
  const taken = row.filter(Boolean).length;
  const broken = brokenTables.has(table.id);
  const selected = selectedTable === table.id;
  const isRound = table.shape === "round";
  const isOver = over === table.id;
  const full = taken >= table.seats;

  return (
    <Box
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (over !== table.id) setOver(table.id);
      }}
      onDrop={(e) => {
        if (!dragId) return;
        e.preventDefault();
        moveGuest(dragId, table.id);
        setDragId(null);
        setOver(null);
      }}
      sx={{
        position: "absolute",
        left: layout.left * scale,
        top: layout.top * scale,
        width: layout.width * scale,
        height: layout.height * scale,
        transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
      }}
    >
      {broken ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: -4,
            border: `2px dashed ${V.error}`,
            borderRadius: isRound ? "50%" : 3,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <ButtonBase
        onClick={() => (holding ? place(table.id) : selectTable(table.id))}
        aria-pressed={selected}
        sx={{
          position: "absolute",
          left: layout.body.x * scale,
          top: layout.body.y * scale,
          width: layout.body.w * scale,
          height: layout.body.h * scale,
          borderRadius: isRound ? "50%" : 2,
          bgcolor: V.paper,
          border: `2px solid ${broken ? V.error : selected ? V.primary : V.divider}`,
          boxShadow: selected ? `0 0 0 3px ${mix(V.primary, 45)}` : `0 1px 2px ${mix(V.text, 15)}`,
          display: "flex",
          flexDirection: isRound ? "column" : "row",
          gap: isRound ? 0 : 1,
          lineHeight: 1.15,
          ...(isOver || (holding && !full)
            ? { bgcolor: mix(V.primary, 12), borderColor: V.primary }
            : {}),
          "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 2 },
        }}
      >
        <SrOnly>
          {`${table.name}, ${taken} of ${table.seats} seats taken${full ? ", full" : ""}${broken ? ", a seating rule is broken" : ""}`}
        </SrOnly>
        <Box aria-hidden component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: broken ? V.error : V.text }}>
          {table.name}
        </Box>
        <Box aria-hidden component="span" sx={{ fontSize: 11, color: full ? V.success : V.text2, fontWeight: 600 }}>
          {taken}/{table.seats}
        </Box>
      </ButtonBase>

      {broken ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: isRound ? 2 : -10,
            right: isRound ? 2 : -6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            bgcolor: V.error,
            color: V.white,
            display: "grid",
            placeItems: "center",
            boxShadow: `0 0 0 2px ${V.paper}`,
            zIndex: 2,
          }}
        >
          <WarningAmber sx={{ fontSize: 14 }} />
        </Box>
      ) : null}

      {layout.seats.map((p, i) => (
        <Seat
          key={i}
          table={table}
          index={i}
          guestId={row[i] ?? null}
          x={p.x * scale}
          y={p.y * scale}
          scale={scale}
          over={over}
          setOver={setOver}
        />
      ))}
    </Box>
  );
}

/* ---------- the plan ---------- */

export function RoomPlan() {
  const { holding, setHolding, canUndo, undo, stats, selectedTable, seats } = usePlan();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [over, setOver] = React.useState<string | null>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, width ? Math.floor(width / ROOM_W) : 36));
  const held = holding ? guestById[holding] : null;

  return (
    <Card component="section" aria-labelledby="plan-title" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Box>
          <Typography id="plan-title" variant="h2" component="h2">
            Room plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.venue} · {ROOM_W} × {ROOM_D} m, drawn to scale
          </Typography>
        </Box>
        <Tooltip title="Undo last change">
          <span>
            <IconButton aria-label="Undo last change" onClick={undo} disabled={!canUndo}>
              <Undo />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {held ? (
        <Alert
          severity="info"
          sx={{ mb: 1.5, alignItems: "center" }}
          action={
            <Button color="inherit" size="small" onClick={() => setHolding(null)}>
              Cancel
            </Button>
          }
        >
          Placing <strong>{held.name}</strong>. Tap an empty seat or a table.
        </Alert>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Drag a guest onto a seat, or tap a guest and then a seat. Tap a table to see who is there.
        </Typography>
      )}

      <Box
        ref={wrapRef}
        tabIndex={0}
        role="region"
        aria-label="Room plan, scrolls sideways on narrow screens"
        sx={{ overflowX: "auto", pb: 1, mx: { xs: -0.5, sm: 0 }, px: { xs: 0.5, sm: 0 } }}
      >
        <Box
          role="group"
          aria-label={`Floor plan of ${event.venue}, ${stats.seatedAll} guests seated`}
          sx={{
            position: "relative",
            width: ROOM_W * scale,
            height: ROOM_D * scale,
            borderRadius: 2,
            bgcolor: V.page,
            backgroundImage: `linear-gradient(to right, ${mix(V.text, 7)} 1px, transparent 1px), linear-gradient(to bottom, ${mix(V.text, 7)} 1px, transparent 1px)`,
            backgroundSize: `${scale}px ${scale}px`,
            boxShadow: `inset 0 0 0 3px ${mix(V.text, 28)}`,
          }}
        >
          {fixtures.map((f) => (
            <FixtureNode key={f.id} f={f} scale={scale} />
          ))}
          {tables.map((t) => (
            <TableNode key={t.id} table={t} scale={scale} over={over} setOver={setOver} />
          ))}
        </Box>
      </Box>

      {selectedTable ? (
        <Box
          aria-live="polite"
          sx={{ mt: 1, p: 1.25, borderRadius: 2, border: `1.5px solid ${V.primary}`, bgcolor: mix(V.primary, 7), fontSize: 13.5 }}
        >
          <strong>{tableById[selectedTable]?.name}</strong>
          {" · "}
          {(seats[selectedTable] ?? []).filter(Boolean).length} of {tableById[selectedTable]?.seats} seats:{" "}
          {(seats[selectedTable] ?? []).filter((g): g is string => g !== null).map((gid, i, arr) => {
            const g = guestById[gid];
            return (
              <React.Fragment key={gid}>
                {g?.name}
                {g?.diet ? <Box component="span" sx={{ color: V.warning, fontWeight: 600 }}> ({g.diet})</Box> : null}
                {i < arr.length - 1 ? ", " : ""}
              </React.Fragment>
            );
          })}
        </Box>
      ) : null}

      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        columnGap={2}
        rowGap={1}
        sx={{ mt: 1, fontSize: 12.5, color: V.text2 }}
        aria-label="Legend"
      >
        <Stack direction="row" alignItems="center" gap={1} aria-hidden>
          <Box sx={{ width: scale, height: 0, borderTop: `3px solid ${V.text}`, position: "relative" }}>
            <Box sx={{ position: "absolute", left: 0, top: -3, width: 3, height: 9, bgcolor: V.text }} />
            <Box sx={{ position: "absolute", right: 0, top: -3, width: 3, height: 9, bgcolor: V.text }} />
          </Box>
          <span>1 m</span>
        </Stack>
        {parties.map((p) => (
          <Stack key={p} direction="row" alignItems="center" gap={0.75}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: partyColor(p) }} />
            <span>{p}</span>
          </Stack>
        ))}
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: V.text }} />
          <span>Dietary need</span>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", border: `2.5px solid ${V.error}` }} />
          <span>Rule broken</span>
        </Stack>
      </Stack>
    </Card>
  );
}
```

```tsx components/Sidebar.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "./Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { tables } from "@/lib/data";
import { firstName, guestById, rsvpLabel, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { GuestDot } from "./UnseatedTray";
import { V, mix } from "./ui";

/* ---------- rules ---------- */

export function RulesCard() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const kept = rules.filter((r) => r.status === "ok").length;
  const waiting = rules.length - broken - kept;

  return (
    <Card component="section" aria-labelledby="rules-title" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography id="rules-title" variant="h2" component="h2">
          The couple&apos;s rules
        </Typography>
        <Chip
          size="small"
          color={broken ? "error" : "success"}
          label={broken ? `${broken} broken` : "All kept"}
          sx={{ fontWeight: 700 }}
        />
      </Stack>
      <Typography
        variant="body2"
        color={broken ? "error" : "text.secondary"}
        role="status"
        sx={{ mt: 0.5, mb: 1, fontWeight: broken ? 600 : 400 }}
      >
        {broken
          ? `${broken} of ${rules.length} rules broken, ${kept} kept${waiting ? `, ${waiting} not yet checkable` : ""}.`
          : `${kept} of ${rules.length} rules kept${waiting ? `, ${waiting} waiting for seats` : ""}.`}
      </Typography>

      <Stack component="ul" gap={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {rules.map((r) => {
          const Icon = r.status === "broken" ? ErrorIcon : r.status === "ok" ? CheckCircle : ScheduleIcon;
          const color = r.status === "broken" ? V.error : r.status === "ok" ? V.success : V.text2;
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          const first = r.tables[0];
          return (
            <Box
              component="li"
              key={r.rule.id}
              sx={{
                border: `1px solid ${r.status === "broken" ? mix(V.error, 55) : V.divider}`,
                bgcolor: r.status === "broken" ? mix(V.error, 8) : "transparent",
                borderRadius: 2,
              }}
            >
              <ButtonBase
                disabled={!first}
                onClick={() => first && selectTable(first)}
                sx={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: 1, p: 1.25, width: "100%", textAlign: "left", borderRadius: 2 }}
              >
                <Icon aria-hidden sx={{ color, fontSize: 20, mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    <Box component="span" sx={{ color, fontWeight: 700 }}>
                      {statusText}:
                    </Box>{" "}
                    {r.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                    {r.detail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontStyle: "italic" }}>
                    {r.rule.note}
                  </Typography>
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}

/* ---------- tables list ---------- */

export function TablesCard() {
  const { seats, selectedTable, selectTable, holding, place, brokenTables, stats } = usePlan();
  return (
    <Card component="section" aria-labelledby="tables-title" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography id="tables-title" variant="h2" component="h2">
          Tables
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stats.seatedAll} seated · {stats.emptySeats} empty
        </Typography>
      </Stack>
      <Stack component="ul" gap={0.5} sx={{ listStyle: "none", m: 0, mt: 1, p: 0 }}>
        {tables.map((t) => {
          const taken = (seats[t.id] ?? []).filter(Boolean).length;
          const full = taken >= t.seats;
          const sel = selectedTable === t.id;
          const bad = brokenTables.has(t.id);
          return (
            <li key={t.id}>
              <ButtonBase
                onClick={() => (holding ? place(t.id) : selectTable(t.id))}
                aria-pressed={sel}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "92px 1fr auto",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                  textAlign: "left",
                  px: 1.25,
                  minHeight: 44,
                  borderRadius: 2,
                  border: `1.5px solid ${sel ? V.primary : "transparent"}`,
                  bgcolor: sel ? mix(V.primary, 10) : holding && !full ? mix(V.primary, 6) : "transparent",
                  "&:hover": { bgcolor: mix(V.primary, 8) },
                  "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 1 },
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 0.5 }}>
                  {t.name}
                  {bad ? <WarningAmber aria-hidden sx={{ fontSize: 16, color: V.error }} /> : null}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(taken / t.seats) * 100}
                  color={full ? "success" : "primary"}
                  aria-hidden
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Box component="span" sx={{ fontSize: 13, fontWeight: 700, minWidth: 32, textAlign: "right", color: full ? V.success : V.text }}>
                  {taken}/{t.seats}
                </Box>
              </ButtonBase>
            </li>
          );
        })}
      </Stack>
    </Card>
  );
}

/* ---------- selected table ---------- */

export function dietSummary(ids: (string | null)[]): { diet: string; n: number }[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const d = id ? guestById[id]?.diet : null;
    if (d) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from(counts, ([diet, n]) => ({ diet, n }));
}

export function TableDetail() {
  const { selectedTable, selectTable, seats, rules, holding, setHolding, place, unseat, focusGuest, setFocusGuest } =
    usePlan();
  const table = selectedTable ? tableById[selectedTable] : null;

  if (!table) {
    return (
      <Card component="section" aria-labelledby="detail-title" sx={{ p: 2 }}>
        <Typography id="detail-title" variant="h2" component="h2">
          Table details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select a table on the plan or in the list to see who is sitting there and what they eat.
        </Typography>
      </Card>
    );
  }

  const row = seats[table.id] ?? [];
  const taken = row.filter(Boolean).length;
  const diets = dietSummary(row);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(table.id));

  return (
    <Card component="section" aria-labelledby="detail-title" sx={{ p: 2, borderColor: V.primary }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Box>
          <Typography id="detail-title" variant="h2" component="h2">
            {table.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {taken} of {table.seats} seats taken · {table.seats - taken} free · {table.shape === "long" ? "long table" : "round table"}
          </Typography>
        </Box>
        <IconButton aria-label="Close table details" size="small" onClick={() => selectTable(null)}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      {issues.length > 0 ? (
        <Stack gap={0.5} sx={{ mt: 1.25 }}>
          {issues.map((r) => (
            <Stack key={r.rule.id} direction="row" gap={0.75} sx={{ color: V.error, fontSize: 13, fontWeight: 600 }}>
              <ErrorIcon aria-hidden sx={{ fontSize: 18 }} />
              <span>{r.title}: {r.detail}</span>
            </Stack>
          ))}
        </Stack>
      ) : null}

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
          DIETARY NEEDS AT THIS TABLE
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
          {diets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              None
            </Typography>
          ) : (
            diets.map((d) => (
              <Chip key={d.diet} size="small" color="warning" variant="outlined" label={`${d.diet} × ${d.n}`} />
            ))
          )}
        </Stack>
      </Box>

      <Stack component="ol" gap={0.5} sx={{ listStyle: "none", m: 0, mt: 1.5, p: 0 }}>
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : null;
          return (
            <Box
              component="li"
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "22px 1fr auto",
                alignItems: "center",
                gap: 1,
                py: 0.75,
                px: 1,
                borderRadius: 2,
                bgcolor: g && focusGuest === g.id ? mix(V.primary, 12) : "transparent",
                borderBottom: `1px solid ${V.divider}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" aria-hidden sx={{ fontWeight: 700 }}>
                {i + 1}
              </Typography>
              {g ? (
                <>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                    <GuestDot guest={g} size={28} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {g.party}
                        {g.rsvp !== "yes" ? ` · RSVP ${rsvpLabel[g.rsvp].toLowerCase()}` : ""}
                      </Typography>
                      {g.diet ? (
                        <Chip size="small" color="warning" variant="outlined" label={g.diet} sx={{ mt: 0.25, height: 20, fontSize: 11 }} />
                      ) : null}
                    </Box>
                  </Stack>
                  <Stack direction="row">
                    <Tooltip title={`Move ${firstName(g.name)}`}>
                      <IconButton
                        size="small"
                        aria-label={`Move ${g.name} to another seat`}
                        aria-pressed={holding === g.id}
                        color={holding === g.id ? "primary" : "default"}
                        onClick={() => {
                          setFocusGuest(g.id);
                          setHolding(holding === g.id ? null : g.id);
                        }}
                      >
                        <SwapHoriz fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Unseat ${firstName(g.name)}`}>
                      <IconButton size="small" aria-label={`Unseat ${g.name}`} onClick={() => unseat(g.id)}>
                        <PersonRemoveOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Empty seat
                  </Typography>
                  {holding ? (
                    <Button size="small" onClick={() => place(table.id, i)}>
                      Place here
                    </Button>
                  ) : (
                    <span />
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
```

```tsx components/SrOnly.tsx
import * as React from "react";
import Box from "@mui/material/Box";

// Text for screen readers only; the visible label next to it is marked aria-hidden.
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
        p: 0,
        m: -0.125,
      }}
    >
      {children}
    </Box>
  );
}
```

```tsx components/Stack.tsx
import * as React from "react";
import MuiStack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

// Material UI 9 keeps flex layout out of Stack's props: it goes through sx.
// This thin wrapper keeps call sites short (gap, alignItems, ...) and forwards everything to Stack.
type FlexProps = {
  gap?: number;
  columnGap?: number;
  rowGap?: number;
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  direction?: "row" | "column";
  component?: React.ElementType;
  sx?: SxProps<Theme>;
};

type Props = FlexProps & Omit<React.ComponentPropsWithoutRef<"div">, "color">;

const Base = MuiStack as React.ElementType;

export default function Stack({ gap, columnGap, rowGap, alignItems, justifyContent, flexWrap, sx, ...rest }: Props) {
  const flex = { gap, columnGap, rowGap, alignItems, justifyContent, flexWrap };
  return <Base {...rest} sx={[flex, ...(Array.isArray(sx) ? sx : [sx])]} />;
}
```

```tsx components/UnseatedTray.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "./Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import { guests } from "@/lib/data";
import type { Guest } from "@/lib/data";
import { initials, partyColor, partyText, rsvpLabel } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { V, mix } from "./ui";

export function GuestDot({ guest, size = 28 }: { guest: Guest; size?: number }) {
  return (
    <Box
      aria-hidden
      component="span"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: partyColor(guest.party),
        color: partyText(guest.party),
        display: "inline-grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

function GuestPick({ guest }: { guest: Guest }) {
  const { holding, setHolding, setDragId } = usePlan();
  const active = holding === guest.id;
  const unconfirmed = guest.rsvp !== "yes";
  return (
    <ButtonBase
      draggable
      aria-pressed={active}
      onClick={() => setHolding(active ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      sx={{
        gap: 1,
        pl: 0.5,
        pr: 1.5,
        py: 0.5,
        minHeight: 44,
        borderRadius: 6,
        border: `1.5px ${unconfirmed ? "dashed" : "solid"} ${active ? V.primary : V.divider}`,
        bgcolor: active ? mix(V.primary, 16) : V.paper,
        cursor: "grab",
        textAlign: "left",
        justifyContent: "flex-start",
        "&:hover": { borderColor: V.primary },
        "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 2 },
      }}
    >
      <GuestDot guest={guest} size={32} />
      <Box component="span" sx={{ display: "block", lineHeight: 1.2 }}>
        <Box component="span" sx={{ display: "block", fontSize: 14, fontWeight: 600, color: V.text }}>
          {guest.name}
        </Box>
        <Box component="span" sx={{ display: "block", fontSize: 12, color: V.text2 }}>
          {guest.party}
          {guest.diet ? ` · ${guest.diet}` : ""}
          {unconfirmed ? ` · ${rsvpLabel[guest.rsvp]}` : ""}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export function UnseatedTray() {
  const { assign, stats, dragId, setDragId, unseat } = usePlan();
  const [over, setOver] = React.useState(false);

  const needSeat = guests.filter((g) => g.rsvp === "yes" && !assign[g.id]);
  const maybe = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]);

  return (
    <Card
      component="section"
      aria-labelledby="tray-title"
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!dragId) return;
        e.preventDefault();
        unseat(dragId);
        setDragId(null);
        setOver(false);
      }}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: over ? V.primary : undefined,
        borderStyle: over ? "dashed" : undefined,
        bgcolor: over ? mix(V.primary, 8) : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
        <Typography id="tray-title" variant="h2" component="h2">
          Needs a seat
        </Typography>
        <Chip
          size="small"
          label={stats.unseated}
          color={stats.unseated ? "warning" : "success"}
          aria-label={`${stats.unseated} attending guests without a seat`}
          sx={{ fontWeight: 700 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", display: { xs: "none", sm: "block" } }}>
          Drop a seated guest here to unseat them
        </Typography>
      </Stack>

      {needSeat.length === 0 ? (
        <Stack direction="row" alignItems="center" gap={1} sx={{ color: "success.main", py: 1 }}>
          <CheckCircleOutline fontSize="small" />
          <Typography variant="body2">Everyone who is coming has a seat.</Typography>
        </Stack>
      ) : (
        <Stack component="ul" direction="row" flexWrap="wrap" gap={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {needSeat.map((g) => (
            <li key={g.id}>
              <GuestPick guest={g} />
            </li>
          ))}
        </Stack>
      )}

      {maybe.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
            WAITING ON AN RSVP · {maybe.length}
          </Typography>
          <Stack component="ul" direction="row" flexWrap="wrap" gap={1} sx={{ listStyle: "none", m: 0, mt: 0.75, p: 0 }}>
            {maybe.map((g) => (
              <li key={g.id}>
                <GuestPick guest={g} />
              </li>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Card>
  );
}
```

```ts components/ui.ts
// CSS variable shortcuts for colours that sx palette keys cannot express (borders, shadows, mixes).
export const V = {
  primary: "var(--mui-palette-primary-main)",
  error: "var(--mui-palette-error-main)",
  warning: "var(--mui-palette-warning-main)",
  success: "var(--mui-palette-success-main)",
  divider: "var(--mui-palette-divider)",
  paper: "var(--mui-palette-background-paper)",
  page: "var(--mui-palette-background-default)",
  white: "var(--mui-palette-common-white)",
  stage: "var(--mui-palette-grey-800)",
  bar: "var(--mui-palette-secondary-main)",
  barText: "var(--mui-palette-secondary-contrastText)",
  text: "var(--mui-palette-text-primary)",
  text2: "var(--mui-palette-text-secondary)",
};

export function mix(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

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

export type RuleKind = "together" | "apart" | "near";

export interface Rule {
  id: string;
  kind: RuleKind;
  guests: string[];
  note: string;
}

export const app = "Seatwise, a seating planner for wedding and event planners";

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

// The Doyle rule names Sean and Ryan in its note, so it points at g-30 and g-31.
export const rules: Rule[] = [
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { id: "r-3", kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { id: "r-4", kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];
```

```ts lib/plan.ts
import { fixtures, guests, rules, tables } from "./data";
import type { Guest, Rule, Rsvp, TableDef } from "./data";

export interface SeatRef {
  table: string;
  seat: number;
}
export type Assign = Record<string, SeatRef | null>;

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]));

export const totalSeats = tables.reduce((n, t) => n + t.seats, 0);

/* ---------- names ---------- */

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

/* ---------- parties ---------- */

export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)));

// Each party takes a theme colour (CSS variables follow the light/dark scheme) and its readable text colour.
const MIXED_FG = "var(--mui-palette-primary-contrastText)";
const PARTY_TOKENS: { bg: string; fg: string }[] = [
  { bg: "var(--mui-palette-secondary-main)", fg: "var(--mui-palette-secondary-contrastText)" },
  { bg: "var(--mui-palette-primary-main)", fg: "var(--mui-palette-primary-contrastText)" },
  { bg: "var(--mui-palette-info-main)", fg: "var(--mui-palette-info-contrastText)" },
  {
    bg: "color-mix(in srgb, var(--mui-palette-info-main) 50%, var(--mui-palette-error-main))",
    fg: MIXED_FG,
  },
  { bg: "var(--mui-palette-warning-main)", fg: "var(--mui-palette-warning-contrastText)" },
  { bg: "var(--mui-palette-grey-600)", fg: "var(--mui-palette-common-white)" },
  {
    bg: "color-mix(in srgb, var(--mui-palette-primary-main) 50%, var(--mui-palette-secondary-main))",
    fg: MIXED_FG,
  },
];

function partyToken(party: string) {
  const i = parties.indexOf(party);
  return PARTY_TOKENS[(i < 0 ? 0 : i) % PARTY_TOKENS.length]!;
}

export function partyColor(party: string): string {
  return partyToken(party).bg;
}

export function partyText(party: string): string {
  return partyToken(party).fg;
}

/* ---------- RSVP and meals ---------- */

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Yes",
  maybe: "Maybe",
  pending: "Pending",
  no: "No",
};

export const STANDARD_MEAL = "Standard menu";

export const meals: string[] = [
  STANDARD_MEAL,
  ...Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort(),
];

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}

/* ---------- seating state ---------- */

export function initialAssign(): Assign {
  const next: Assign = {};
  const used: Record<string, number> = {};
  for (const g of guests) {
    if (g.table && tableById[g.table]) {
      const i = used[g.table] ?? 0;
      used[g.table] = i + 1;
      next[g.id] = { table: g.table, seat: i };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

export function seatsByTable(assign: Assign): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {};
  for (const t of tables) out[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [gid, ref] of Object.entries(assign)) {
    if (ref) {
      const arr = out[ref.table];
      if (arr) arr[ref.seat] = gid;
    }
  }
  return out;
}

export function firstFreeSeat(seats: (string | null)[], ignore?: string): number {
  return seats.findIndex((s) => s === null || s === ignore);
}

/* ---------- geometry (metres) ---------- */

export const SEAT_D = 0.8;
export const RING_R = 1.35;
export const BODY_R = 0.85;
export const ROUND_R = RING_R + SEAT_D / 2;
export const LONG_DEPTH = 1;

export interface TableLayout {
  /** container box, metres */
  left: number;
  top: number;
  width: number;
  height: number;
  /** table body relative to container */
  body: { x: number; y: number; w: number; h: number };
  /** seat centres relative to container */
  seats: { x: number; y: number }[];
  /** centre in room coordinates */
  cx: number;
  cy: number;
}

export function tableLayout(t: TableDef): TableLayout {
  if (t.shape === "round") {
    const size = ROUND_R * 2;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      return { x: ROUND_R + RING_R * Math.cos(a), y: ROUND_R + RING_R * Math.sin(a) };
    });
    return {
      left: t.x - ROUND_R,
      top: t.y - ROUND_R,
      width: size,
      height: size,
      body: { x: ROUND_R - BODY_R, y: ROUND_R - BODY_R, w: BODY_R * 2, h: BODY_R * 2 },
      seats,
      cx: t.x,
      cy: t.y,
    };
  }
  const length = t.seats;
  const height = LONG_DEPTH + 0.1 + SEAT_D;
  return {
    left: t.x,
    top: t.y,
    width: length,
    height,
    body: { x: 0, y: 0, w: length, h: LONG_DEPTH },
    seats: Array.from({ length: t.seats }, (_, i) => ({ x: i + 0.5, y: LONG_DEPTH + 0.1 + SEAT_D / 2 })),
    cx: t.x + length / 2,
    cy: t.y + height / 2,
  };
}

const layouts: Record<string, TableLayout> = Object.fromEntries(tables.map((t) => [t.id, tableLayout(t)]));

export function layoutOf(tableId: string): TableLayout {
  return layouts[tableId]!;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const doors = fixtures.find((f) => f.kind === "door");
const stage = fixtures.find((f) => f.kind === "stage");
const doorPoint = doors ? { x: doors.x + doors.w / 2, y: doors.y + doors.h / 2 } : { x: 0, y: 7 };
const bandPoint = stage ? { x: stage.x + stage.w / 2, y: stage.y + stage.h / 2 } : { x: 12, y: 1.5 };

export const NEAR_DOOR_M = 4;
export const AWAY_BAND_M = 6;

export function distanceToDoors(tableId: string): number {
  const l = layoutOf(tableId);
  return distance({ x: l.cx, y: l.cy }, doorPoint);
}
export function distanceToBand(tableId: string): number {
  const l = layoutOf(tableId);
  return distance({ x: l.cx, y: l.cy }, bandPoint);
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tables: string[];
  guestIds: string[];
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

export function evaluateRules(assign: Assign): RuleResult[] {
  return rules.map((rule): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id);
    const refs = rule.guests.map((id) => assign[id] ?? null);

    if (rule.kind === "near") {
      const title = `${names[0]} near the garden doors, away from the band`;
      const ref = refs[0];
      if (!ref) {
        return { rule, status: "waiting", title, detail: `${names[0]} has no seat yet.`, tables: [], guestIds: [] };
      }
      const dd = distanceToDoors(ref.table);
      const db = distanceToBand(ref.table);
      const good = dd <= NEAR_DOOR_M && db >= AWAY_BAND_M;
      const closest = [...tables].sort((a, b) => distanceToDoors(a.id) - distanceToDoors(b.id))[0];
      return good
        ? {
            rule,
            status: "ok",
            title,
            detail: `${tableName(ref.table)} is ${dd.toFixed(1)} m from the doors and ${db.toFixed(1)} m from the band.`,
            tables: [ref.table],
            guestIds: [],
          }
        : {
            rule,
            status: "broken",
            title,
            detail: `${tableName(ref.table)} is ${dd.toFixed(1)} m from the doors. ${closest ? `${closest.name} is closest (${distanceToDoors(closest.id).toFixed(1)} m).` : ""}`,
            tables: [ref.table],
            guestIds: [rule.guests[0]!],
          };
    }

    const [a, b] = refs;
    const [na, nb] = names;
    if (rule.kind === "together") {
      const title = `${na} and ${nb} together`;
      if (!a || !b) {
        const missing = [!a ? na : null, !b ? nb : null].filter(Boolean).join(" and ");
        return { rule, status: "waiting", title, detail: `${missing} still to be seated.`, tables: [], guestIds: [] };
      }
      if (a.table === b.table) {
        return { rule, status: "ok", title, detail: `Both at ${tableName(a.table)}.`, tables: [a.table], guestIds: [] };
      }
      return {
        rule,
        status: "broken",
        title,
        detail: `${na} is at ${tableName(a.table)}, ${nb} at ${tableName(b.table)}.`,
        tables: [a.table, b.table],
        guestIds: [...rule.guests],
      };
    }

    const title = `${na} and ${nb} apart`;
    if (!a || !b) {
      return { rule, status: "waiting", title, detail: "Checked once both have a seat.", tables: [], guestIds: [] };
    }
    if (a.table === b.table) {
      return {
        rule,
        status: "broken",
        title,
        detail: `Both are at ${tableName(a.table)}.`,
        tables: [a.table],
        guestIds: [...rule.guests],
      };
    }
    return {
      rule,
      status: "ok",
      title,
      detail: `${tableName(a.table)} and ${tableName(b.table)}.`,
      tables: [a.table, b.table],
      guestIds: [],
    };
  });
}

/* ---------- counts ---------- */

export interface Stats {
  attending: number;
  seatedAttending: number;
  seatedOther: number;
  seatedAll: number;
  unseated: number;
  emptySeats: number;
}

export function computeStats(assign: Assign): Stats {
  const attending = guests.filter((g) => g.rsvp === "yes");
  const seatedAttending = attending.filter((g) => assign[g.id]).length;
  const seatedAll = guests.filter((g) => assign[g.id]).length;
  return {
    attending: attending.length,
    seatedAttending,
    seatedOther: seatedAll - seatedAttending,
    seatedAll,
    unseated: attending.length - seatedAttending,
    emptySeats: totalSeats - seatedAll,
  };
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

