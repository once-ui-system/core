```tsx app/guests/page.tsx
import type { Metadata } from "next";
import GuestsView from "@/components/GuestsView";

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
import AppShell from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Seatwise",
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
import PlanView from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// Colours the floor plan and guest dots use. They live in the theme so both colour schemes can
// restyle them and nothing else in the app carries a raw colour.
interface PlanPalette {
  floor: string;
  wall: string;
  grid: string;
  tableFill: string;
  tableStroke: string;
  stage: string;
  stageText: string;
  dance: string;
  danceLine: string;
  bar: string;
  door: string;
  seatEmpty: string;
  text: string;
  muted: string;
  diet: string;
}

interface PartyPalette {
  couple: string;
  bride: string;
  groom: string;
  university: string;
  work: string;
  football: string;
  plusones: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    plan: PlanPalette;
    party: PartyPalette;
  }
  interface PaletteOptions {
    plan?: PlanPalette;
    party?: PartyPalette;
  }
}

// Party colours are mid-dark so white initials stay readable in both schemes.
const party: PartyPalette = {
  couple: "#a3234f",
  bride: "#1f6f8b",
  groom: "#7a4eab",
  university: "#a85a00",
  work: "#2e7d4f",
  football: "#3a4bb0",
  plusones: "#5f6b73",
};

// Seatwise: warm paper neutrals, a deep conifer green as the brand, terracotta as the accent.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5e50", light: "#4f8575", dark: "#1d4136", contrastText: "#ffffff" },
        secondary: { main: "#a8482a", contrastText: "#ffffff" },
        error: { main: "#b3261e" },
        warning: { main: "#8a5a00", light: "#c98a1b" },
        success: { main: "#2e6b3f" },
        background: { default: "#f5f3ef", paper: "#ffffff" },
        text: { primary: "#1f2421", secondary: "#58605b" },
        divider: "#e2ded6",
        party,
        plan: {
          floor: "#fbfaf7",
          wall: "#8c8579",
          grid: "#ece8df",
          tableFill: "#ffffff",
          tableStroke: "#b9b2a5",
          stage: "#47403a",
          stageText: "#f5f1ea",
          dance: "#efe3cf",
          danceLine: "#dccaa8",
          bar: "#d9c7ae",
          door: "#6aa384",
          seatEmpty: "#a39c8f",
          text: "#2d2a26",
          muted: "#6c665c",
          diet: "#f2b233",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#86c7b2", light: "#a8dccb", dark: "#5aa38c", contrastText: "#0c1a15" },
        secondary: { main: "#e79a7a", contrastText: "#2a0f06" },
        error: { main: "#ff8a80" },
        warning: { main: "#f0b44c" },
        success: { main: "#7fd09a" },
        background: { default: "#121513", paper: "#1b1f1d" },
        text: { primary: "#ecefec", secondary: "#a4aca7" },
        divider: "#2e3431",
        party,
        plan: {
          floor: "#1a1d1b",
          wall: "#6e756f",
          grid: "#232724",
          tableFill: "#272c29",
          tableStroke: "#566059",
          stage: "#3a413d",
          stageText: "#e8ece8",
          dance: "#2d3330",
          danceLine: "#3c4540",
          bar: "#3b3a33",
          door: "#3f7a5b",
          seatEmpty: "#6f7872",
          text: "#e7ebe8",
          muted: "#a1aaa4",
          diet: "#f2b233",
        },
      },
    },
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 650, letterSpacing: "-0.01em" },
    h6: { fontWeight: 650 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { minHeight: 48 } } },
  },
});

export default theme;
```

```tsx components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import { initials, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--mui-palette-primary-main)" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="var(--mui-palette-primary-contrastText)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        return (
          <circle
            key={i}
            cx={(16 + Math.cos(a) * 9.5).toFixed(2)}
            cy={(16 + Math.sin(a) * 9.5).toFixed(2)}
            r="1.8"
            fill="var(--mui-palette-primary-contrastText)"
          />
        );
      })}
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode } = useColorScheme();
  const dark = mode === "dark";

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
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
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
          <Box
            component={Link}
            href="/"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none" }}
            aria-label="Seatwise home"
          >
            <Mark />
            <Typography variant="h6" component="span" sx={{ fontWeight: 750, letterSpacing: "-0.02em", display: { xs: "none", sm: "inline" } }}>
              Seatwise
            </Typography>
          </Box>
          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5, ml: { sm: 2 } }}>
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    px: { xs: 1.25, sm: 2 },
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? "action.selected" : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.label}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={dark ? "Switch to light theme" : "Switch to dark theme"}>
            <IconButton
              onClick={() => setMode(dark ? "light" : "dark")}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {dark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
              {initials(planner.name)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: "none", md: "block" } }}>
              {planner.name}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/FloorPlan.tsx
"use client";

import type { KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import {
  FALLBACK_PARTY_COLOR,
  event,
  firstName,
  fixtures,
  guestById,
  initials,
  partyColors,
  tables,
  type PlanTable,
} from "@/lib/data";
import { LONG_H, LONG_W, SEAT_R, roundBodyRadius, seatSpots, tableReach } from "@/lib/geometry";
import { usePlan } from "@/lib/plan";
import type { DropTarget, StartDrag } from "./useGuestDrag";

interface FloorPlanProps {
  selectedTableId: string | null;
  focusGuestId: string | null;
  armedGuestId: string | null;
  showNames: boolean;
  dragGuestId: string | null;
  dropTarget: DropTarget;
  startDrag: StartDrag;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, seat: number) => void;
}

const W = event.room_m.width;
const D = event.room_m.depth;
const PAD_X = 1.5;
const PAD_Y = 1.0;

// Every colour below is a CSS variable the theme generates (see app/theme.ts), so the plan follows
// the light and dark schemes.
const plan = (k: string) => `var(--mui-palette-plan-${k})`;
const C = {
  floor: plan("floor"),
  wall: plan("wall"),
  grid: plan("grid"),
  tableFill: plan("tableFill"),
  tableStroke: plan("tableStroke"),
  stage: plan("stage"),
  stageText: plan("stageText"),
  dance: plan("dance"),
  danceLine: plan("danceLine"),
  bar: plan("bar"),
  door: plan("door"),
  seatEmpty: plan("seatEmpty"),
  text: plan("text"),
  muted: plan("muted"),
  diet: plan("diet"),
  accent: "var(--mui-palette-primary-main)",
  danger: "var(--mui-palette-error-main)",
  warn: "var(--mui-palette-warning-main)",
  white: "var(--mui-palette-common-white)",
};

export default function FloorPlan(props: FloorPlanProps) {
  return (
    <Box sx={{ overflowX: "auto", overscrollBehaviorX: "contain", borderRadius: 2 }}>
      <svg
        viewBox={`${-PAD_X} ${-PAD_Y} ${W + PAD_X * 2} ${D + PAD_Y * 2}`}
        style={{ display: "block", width: "100%", minWidth: 700, height: "auto" }}
        role="group"
        aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres, drawn to scale`}
        fontFamily="inherit"
      >
        <defs>
          <pattern id="sw-grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke={C.grid} strokeWidth="0.03" />
          </pattern>
          <pattern id="sw-dance" width="1" height="1" patternUnits="userSpaceOnUse">
            <rect width="0.5" height="0.5" fill={C.danceLine} opacity="0.55" />
            <rect x="0.5" y="0.5" width="0.5" height="0.5" fill={C.danceLine} opacity="0.55" />
          </pattern>
        </defs>

        {/* Room */}
        <rect x={0} y={0} width={W} height={D} fill={C.floor} />
        <rect x={0} y={0} width={W} height={D} fill="url(#sw-grid)" />
        <rect x={0} y={0} width={W} height={D} fill="none" stroke={C.wall} strokeWidth={0.16} />

        {/* Dimensions and scale */}
        <text x={W / 2} y={-0.4} textAnchor="middle" fontSize={0.38} fill={C.muted}>
          {W} m
        </text>
        <text
          x={W + 0.55}
          y={D / 2}
          textAnchor="middle"
          fontSize={0.38}
          fill={C.muted}
          transform={`rotate(90 ${W + 0.55} ${D / 2})`}
        >
          {D} m
        </text>
        <g aria-hidden="true">
          <line x1={0} y1={D + 0.55} x2={5} y2={D + 0.55} stroke={C.muted} strokeWidth={0.07} />
          <line x1={0} y1={D + 0.4} x2={0} y2={D + 0.7} stroke={C.muted} strokeWidth={0.07} />
          <line x1={5} y1={D + 0.4} x2={5} y2={D + 0.7} stroke={C.muted} strokeWidth={0.07} />
          <text x={5.3} y={D + 0.55} fontSize={0.36} dominantBaseline="central" fill={C.muted}>
            5 m
          </text>
        </g>

        {/* Fixtures */}
        {fixtures.map((f) => {
          const cx = f.x + f.w / 2;
          const cy = f.y + f.h / 2;
          if (f.kind === "door") {
            return (
              <g key={f.id}>
                <rect x={f.x - 0.08} y={f.y} width={f.w + 0.16} height={f.h} rx={0.08} fill={C.door} />
                <text
                  x={-0.6}
                  y={cy}
                  textAnchor="middle"
                  fontSize={0.4}
                  fontWeight={600}
                  fill={C.text}
                  transform={`rotate(-90 -0.6 ${cy})`}
                >
                  {f.label}
                </text>
              </g>
            );
          }
          const dance = f.kind === "dancefloor";
          const fill = f.kind === "stage" ? C.stage : f.kind === "bar" ? C.bar : C.dance;
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={dance ? 0.1 : 0.2}
                fill={fill}
                stroke={dance ? C.danceLine : "none"}
                strokeWidth={0.05}
              />
              {dance && <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.1} fill="url(#sw-dance)" />}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dance ? 0.55 : 0.46}
                fontWeight={700}
                letterSpacing={dance ? 0.08 : 0}
                fill={f.kind === "stage" ? C.stageText : C.text}
                stroke={dance ? C.dance : "none"}
                strokeWidth={dance ? 0.18 : 0}
                style={dance ? { paintOrder: "stroke" } : undefined}
              >
                {f.label}
              </text>
            </g>
          );
        })}

        {/* Tables */}
        {tables.map((t) => (
          <TableShape key={t.id} table={t} {...props} />
        ))}
      </svg>
    </Box>
  );
}

function TableShape({
  table: t,
  selectedTableId,
  focusGuestId,
  armedGuestId,
  showNames,
  dragGuestId,
  dropTarget,
  startDrag,
  onTableClick,
  onSeatClick,
}: FloorPlanProps & { table: PlanTable }) {
  const { seats, brokenByTable } = usePlan();
  const row = seats[t.id] ?? [];
  const taken = row.filter(Boolean).length;
  const spots = seatSpots(t);
  const reach = tableReach(t);
  const selected = selectedTableId === t.id;
  const broken = brokenByTable[t.id] ?? [];
  const isDropTarget = dropTarget !== null && dropTarget.type !== "unseat" && dropTarget.tableId === t.id;
  const full = taken >= t.seats;
  const dragging = dragGuestId !== null;
  const draggedHere = dragGuestId !== null && row.includes(dragGuestId);
  const dropBlocked = isDropTarget && full && !draggedHere;

  const label =
    `${t.name}, ${taken} of ${t.seats} seats taken` +
    (broken.length ? `, ${broken.length} seating ${broken.length === 1 ? "rule" : "rules"} broken` : "");

  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTableClick(t.id);
    }
  };

  const bodyFill = isDropTarget
    ? `color-mix(in srgb, ${dropBlocked ? C.danger : C.accent} 24%, ${C.tableFill})`
    : selected
      ? `color-mix(in srgb, ${C.accent} 12%, ${C.tableFill})`
      : C.tableFill;

  return (
    <g
      transform={`translate(${t.x} ${t.y}) rotate(${t.rotation ?? 0})`}
      data-drop-table={t.id}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onTableClick(t.id)}
      onKeyDown={onKey}
      style={{ cursor: armedGuestId || dragging ? "copy" : "pointer" }}
    >
      {/* Generous hit area so drops and taps near the table count */}
      <circle r={reach + 0.25} fill="transparent" />

      {/* Rings: selection (solid), drop target (dashed) and broken rule (dashed, red) */}
      {selected && <circle r={reach + 0.2} fill="none" stroke={C.accent} strokeWidth={0.1} opacity={0.9} />}
      {isDropTarget && !selected && (
        <circle
          r={reach + 0.2}
          fill="none"
          stroke={dropBlocked ? C.danger : C.accent}
          strokeWidth={0.1}
          strokeDasharray="0.3 0.2"
        />
      )}
      {broken.length > 0 && (
        <g>
          <circle r={reach + 0.5} fill="none" stroke={C.danger} strokeWidth={0.1} strokeDasharray="0.35 0.22" />
          <g transform={`translate(${reach * 0.72} ${-reach * 0.72})`}>
            <circle r={0.34} fill={C.danger} stroke={C.floor} strokeWidth={0.07} />
            <text aria-hidden="true" textAnchor="middle" dominantBaseline="central" fontSize={0.46} fontWeight={800} fill={C.white}>
              !
            </text>
          </g>
        </g>
      )}

      {/* Table body */}
      {t.shape === "round" ? (
        <circle r={roundBodyRadius(t)} fill={bodyFill} stroke={C.tableStroke} strokeWidth={0.08} />
      ) : (
        <rect
          x={-LONG_W / 2}
          y={-LONG_H / 2}
          width={LONG_W}
          height={LONG_H}
          rx={0.25}
          fill={bodyFill}
          stroke={C.tableStroke}
          strokeWidth={0.08}
        />
      )}
      <text aria-hidden="true" textAnchor="middle" y={-0.14} dominantBaseline="central" fontSize={0.3} fontWeight={700} fill={C.text}>
        {t.name}
      </text>
      <text
        aria-hidden="true"
        textAnchor="middle"
        y={0.2}
        dominantBaseline="central"
        fontSize={0.28}
        fontWeight={600}
        fill={full ? C.muted : C.warn}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {taken}/{t.seats}
      </text>

      {/* Seats */}
      {spots.map((s, i) => {
        const guestId = row[i] ?? null;
        const guest = guestId ? guestById[guestId] : null;
        const color = guest ? (partyColors[guest.party] ?? FALLBACK_PARTY_COLOR) : null;
        const isFocus = guestId !== null && guestId === focusGuestId;
        const isArmed = guestId !== null && guestId === armedGuestId;
        const isGhost = guestId !== null && guestId === dragGuestId;
        const seatHover =
          dropTarget !== null && dropTarget.type === "seat" && dropTarget.tableId === t.id && dropTarget.seat === i;
        const lx = s.x + s.dx * (SEAT_R + 0.1);
        const ly = s.y + s.dy * (SEAT_R + 0.1) + s.dy * 0.17;
        const anchor = s.dx > 0.4 ? "start" : s.dx < -0.4 ? "end" : "middle";
        return (
          <g
            key={i}
            data-seat-table={t.id}
            data-seat-index={i}
            aria-hidden="true"
            style={{ touchAction: "none", cursor: guest ? "grab" : "inherit" }}
            onPointerDown={guestId ? (e) => startDrag(e, guestId) : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onSeatClick(t.id, i);
            }}
          >
            <title>
              {guest
                ? `${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}`
                : `${t.name}, seat ${i + 1} is empty`}
            </title>
            <circle cx={s.x} cy={s.y} r={SEAT_R + 0.08} fill="transparent" />
            {guest && color ? (
              <>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={SEAT_R}
                  fill={color}
                  opacity={isGhost ? 0.35 : 1}
                  stroke={isFocus || isArmed ? C.text : C.floor}
                  strokeWidth={isFocus || isArmed ? 0.12 : 0.05}
                />
                <text
                  x={s.x}
                  y={s.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.3}
                  fontWeight={700}
                  fill={C.white}
                  pointerEvents="none"
                  opacity={isGhost ? 0.5 : 1}
                >
                  {initials(guest.name)}
                </text>
                {guest.diet && (
                  <circle
                    cx={s.x + SEAT_R * 0.72}
                    cy={s.y - SEAT_R * 0.72}
                    r={0.15}
                    fill={C.diet}
                    stroke={C.floor}
                    strokeWidth={0.05}
                    pointerEvents="none"
                  />
                )}
                {showNames && (
                  <text
                    aria-hidden="true"
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    fontSize={0.34}
                    fontWeight={isFocus ? 800 : 600}
                    fill={C.text}
                    stroke={C.floor}
                    strokeWidth={0.12}
                    strokeLinejoin="round"
                    pointerEvents="none"
                    style={{ paintOrder: "stroke" }}
                  >
                    {firstName(guest.name)}
                  </text>
                )}
              </>
            ) : (
              <circle
                cx={s.x}
                cy={s.y}
                r={SEAT_R - 0.04}
                fill={seatHover ? `color-mix(in srgb, ${C.accent} 35%, transparent)` : "none"}
                stroke={seatHover ? C.accent : C.seatEmpty}
                strokeWidth={seatHover ? 0.12 : 0.07}
                strokeDasharray={seatHover ? undefined : "0.16 0.12"}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
```

```tsx components/GuestBits.tsx
"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { FALLBACK_PARTY_COLOR, initials, partyColors, rsvpLabels, type Guest, type Rsvp } from "@/lib/data";

export function GuestDot({ guest, size = 32 }: { guest: Guest; size?: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        bgcolor: partyColors[guest.party] ?? FALLBACK_PARTY_COLOR,
        color: "common.white",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0.2,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

export function dietColor(diet: string): "error" | "warning" | "info" {
  if (/allergy/i.test(diet)) return "error";
  if (/children/i.test(diet)) return "info";
  return "warning";
}

export function DietChip({ diet }: { diet: string }) {
  return <Chip size="small" variant="outlined" color={dietColor(diet)} label={diet} />;
}

export function RsvpChip({ rsvp }: { rsvp: Rsvp }) {
  const color = rsvp === "yes" ? "success" : rsvp === "no" ? "error" : "default";
  return (
    <Chip
      size="small"
      variant={rsvp === "yes" ? "filled" : "outlined"}
      color={color}
      label={rsvpLabels[rsvp]}
      sx={rsvp === "yes" ? { bgcolor: "success.main", color: "success.contrastText" } : undefined}
    />
  );
}
```

```tsx components/GuestsView.tsx
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
```

```tsx components/PlanView.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import Close from "@mui/icons-material/Close";
import DragIndicator from "@mui/icons-material/DragIndicator";
import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import TextFields from "@mui/icons-material/TextFields";
import {
  event,
  formatDate,
  guestById,
  guests,
  partyColors,
  planner,
  rsvpLabels,
  tableById,
  tables,
  type Guest,
} from "@/lib/data";
import { usePlan, type PlaceResult } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import FloorPlan from "./FloorPlan";
import { DietChip, GuestDot } from "./GuestBits";
import { useGuestDrag, type DropTarget, type StartDrag } from "./useGuestDrag";

type PanelTab = "unseated" | "tables" | "details";

interface Toast {
  id: number;
  ok: boolean;
  message: string;
}

export default function PlanView() {
  const plan = usePlan();
  const { seats, totals, ruleResults, place, unseat, brokenByTable, tableOfGuest, seatedCount } = plan;

  const [selectedTableId, setSelectedTableId] = useState<string | null>("t-1");
  const [focusGuestId, setFocusGuestId] = useState<string | null>(null);
  const [armedGuestId, setArmedGuestId] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [tab, setTab] = useState<PanelTab>("unseated");
  const [toast, setToast] = useState<Toast | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((r: PlaceResult) => {
    setToast({ id: Date.now(), ok: r.ok, message: r.message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!armedGuestId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armedGuestId]);

  const showTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setTab("details");
  }, []);

  const placeGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const r = place(guestId, tableId, seat);
      announce(r);
      if (r.ok) {
        setFocusGuestId(guestId);
        setSelectedTableId(tableId);
        setArmedGuestId(null);
      }
      return r;
    },
    [place, announce],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const r = unseat(guestId);
      announce(r);
      if (r.ok) {
        setArmedGuestId(null);
        setFocusGuestId(guestId);
      }
    },
    [unseat, announce],
  );

  const onDrop = useCallback(
    (guestId: string, target: DropTarget) => {
      if (!target) return;
      if (target.type === "unseat") {
        if (tableOfGuest(guestId)) unseatGuest(guestId);
        return;
      }
      placeGuest(guestId, target.tableId, target.type === "seat" ? target.seat : undefined);
    },
    [placeGuest, unseatGuest, tableOfGuest],
  );

  const { drag, startDrag } = useGuestDrag(onDrop);

  const onTableClick = (tableId: string) => {
    if (armedGuestId) {
      placeGuest(armedGuestId, tableId);
      return;
    }
    showTable(tableId);
  };

  const onSeatClick = (tableId: string, seat: number) => {
    const occupant = seats[tableId]?.[seat] ?? null;
    if (armedGuestId && !occupant) {
      placeGuest(armedGuestId, tableId, seat);
      return;
    }
    if (armedGuestId) {
      placeGuest(armedGuestId, tableId);
      return;
    }
    if (occupant) setFocusGuestId(occupant);
    showTable(tableId);
  };

  const arm = (guestId: string) => {
    setArmedGuestId((cur) => (cur === guestId ? null : guestId));
    setFocusGuestId(guestId);
  };

  const unseated = useMemo(
    () => guests.filter((g) => g.rsvp !== "no" && !tableOfGuest(g.id)),
    // seats changes whenever someone moves
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seats],
  );
  const attendingUnseated = unseated.filter((g) => g.rsvp === "yes");
  const unconfirmedUnseated = unseated.filter((g) => g.rsvp !== "yes");
  const broken = ruleResults.filter((r) => r.status === "broken");
  const dragGuest = drag ? guestById[drag.guestId] : null;
  const dragSeated = drag ? tableOfGuest(drag.guestId) !== null : false;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1680, mx: "auto" }}>
      <Header
        seated={totals.seated}
        capacity={totals.capacity}
        attending={totals.attending}
        attendingUnseated={totals.attendingUnseated}
        broken={broken.length}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
          alignItems: "start",
          mt: 2.5,
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <RulesCard results={ruleResults} onShow={showTable} />
          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 1, mb: 1.5 }}
            >
              <Box>
                <Typography variant="h6" component="h2">
                  Room plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.venue}, {event.room_m.width} × {event.room_m.depth} m. Drag a guest to a table or seat, or tap
                  a guest and then a table.
                </Typography>
              </Box>
              <ToggleButton
                value="names"
                size="small"
                selected={showNames}
                onChange={() => setShowNames((s) => !s)}
                aria-label="Show first names beside seats"
                sx={{ gap: 0.75, px: 1.5 }}
              >
                <TextFields fontSize="small" /> Names
              </ToggleButton>
            </Stack>
            <FloorPlan
              selectedTableId={selectedTableId}
              focusGuestId={focusGuestId}
              armedGuestId={armedGuestId}
              showNames={showNames}
              dragGuestId={drag?.guestId ?? null}
              dropTarget={drag?.target ?? null}
              startDrag={startDrag}
              onTableClick={onTableClick}
              onSeatClick={onSeatClick}
            />
            <Legend />
          </Paper>
        </Stack>

        <Paper
          ref={panelRef}
          variant="outlined"
          sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 88 }, scrollMarginTop: 80 }}
        >
          <Tabs
            value={tab}
            onChange={(_, v: PanelTab) => setTab(v)}
            variant="fullWidth"
            aria-label="Plan side panel"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="unseated" label={`To seat (${attendingUnseated.length})`} id="tab-unseated" aria-controls="panel-unseated" />
            <Tab value="tables" label="Tables" id="tab-tables" aria-controls="panel-tables" />
            <Tab value="details" label="Table" id="tab-details" aria-controls="panel-details" />
          </Tabs>
          <Box sx={{ maxHeight: { lg: "calc(100vh - 190px)" }, overflowY: "auto" }}>
            {tab === "unseated" && (
              <Box role="tabpanel" id="panel-unseated" aria-labelledby="tab-unseated">
                <UnseatedPanel
                  attending={attendingUnseated}
                  unconfirmed={unconfirmedUnseated}
                  armedGuestId={armedGuestId}
                  startDrag={startDrag}
                  onArm={arm}
                  draggingSeated={dragSeated}
                  dropActive={drag?.target?.type === "unseat"}
                />
              </Box>
            )}
            {tab === "tables" && (
              <Box role="tabpanel" id="panel-tables" aria-labelledby="tab-tables">
                <TablesPanel
                  selectedTableId={selectedTableId}
                  onSelect={showTable}
                  seatedCount={seatedCount}
                  brokenCount={(id) => (brokenByTable[id] ?? []).length}
                />
              </Box>
            )}
            {tab === "details" && (
              <Box role="tabpanel" id="panel-details" aria-labelledby="tab-details">
                <TableDetails
                  tableId={selectedTableId}
                  focusGuestId={focusGuestId}
                  broken={selectedTableId ? (brokenByTable[selectedTableId] ?? []) : []}
                  onMove={arm}
                  onUnseat={unseatGuest}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Bottom layer: placing bar and result toast */}
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 16,
          px: 2,
          zIndex: (t) => t.zIndex.snackbar,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {toast && (
          <Alert
            key={toast.id}
            severity={toast.ok ? "success" : "warning"}
            variant="filled"
            role="status"
            onClose={() => setToast(null)}
            sx={{ pointerEvents: "auto", maxWidth: 560, boxShadow: 6 }}
          >
            {toast.message}
          </Alert>
        )}
        {armedGuestId && guestById[armedGuestId] && (
          <PlacingBar
            guest={guestById[armedGuestId]}
            currentTable={tableOfGuest(armedGuestId)}
            seatedCount={seatedCount}
            onPick={(tableId) => placeGuest(armedGuestId, tableId)}
            onCancel={() => setArmedGuestId(null)}
          />
        )}
      </Stack>

      {drag && dragGuest && (
        <Box
          aria-hidden="true"
          sx={{
            position: "fixed",
            left: drag.x + 14,
            top: drag.y + 10,
            zIndex: (t) => t.zIndex.tooltip + 1,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
            pl: 0.75,
            pr: 1.5,
            py: 0.5,
            borderRadius: 99,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "primary.main",
            boxShadow: 6,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <GuestDot guest={dragGuest} size={26} />
          {dragGuest.name}
        </Box>
      )}
    </Box>
  );
}

function Header(props: {
  seated: number;
  capacity: number;
  attending: number;
  attendingUnseated: number;
  broken: number;
}) {
  const tiles: { label: string; value: string; sub: string; tone?: "error" | "warning" | "success" }[] = [
    { label: "Attending", value: String(props.attending), sub: `of ${guests.length} invited` },
    {
      label: "Seated",
      value: String(props.seated),
      sub: `of ${props.capacity} seats`,
      tone: "success",
    },
    {
      label: "Still to seat",
      value: String(props.attendingUnseated),
      sub: props.attendingUnseated === 0 ? "everyone attending has a seat" : "attending, no seat yet",
      tone: props.attendingUnseated > 0 ? "warning" : "success",
    },
    {
      label: "Rules broken",
      value: String(props.broken),
      sub: props.broken === 0 ? "all rules kept so far" : "see the summary below",
      tone: props.broken > 0 ? "error" : "success",
    },
  ];
  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            {formatDate(event.date)}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, sm: 32 } }}>
            {event.name}
          </Typography>
          <Typography color="text.secondary">
            {event.venue}. Seating plan by {planner.name}.
          </Typography>
        </Box>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(120px, 1fr))" },
            gap: 1.5,
            minWidth: { md: 520 },
          }}
        >
          {tiles.map((t) => (
            <Paper key={t.label} variant="outlined" sx={{ px: 1.75, py: 1.25 }}>
              <Typography component="dt" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t.label}
              </Typography>
              <Typography
                component="dd"
                sx={{
                  m: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  fontVariantNumeric: "tabular-nums",
                  color: t.tone === "error" ? "error.main" : t.tone === "warning" ? "warning.main" : "text.primary",
                }}
              >
                {t.value}
              </Typography>
              <Typography component="dd" variant="caption" color="text.secondary" sx={{ m: 0, display: "block" }}>
                {t.sub}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

function statusIcon(status: RuleResult["status"]) {
  if (status === "broken") return <ErrorOutline color="error" fontSize="small" titleAccess="Broken" />;
  if (status === "open") return <HourglassEmpty color="warning" fontSize="small" titleAccess="Waiting for seating" />;
  return <CheckCircleOutline color="success" fontSize="small" titleAccess="Kept" />;
}

function RulesCard({ results, onShow }: { results: RuleResult[]; onShow: (tableId: string) => void }) {
  const [all, setAll] = useState(false);
  const broken = results.filter((r) => r.status === "broken");
  const open = results.filter((r) => r.status === "open");
  const ok = results.filter((r) => r.status === "ok");
  const shown = all ? results : broken;
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="rules-heading"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: broken.length ? "error.main" : "divider",
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h6" component="h2" id="rules-heading">
            The couple&apos;s rules
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }} role="status">
            <Chip
              size="small"
              color={broken.length ? "error" : "default"}
              variant={broken.length ? "filled" : "outlined"}
              label={`${broken.length} broken`}
              sx={broken.length ? { bgcolor: "error.main", color: "error.contrastText" } : undefined}
            />
            <Chip size="small" variant="outlined" label={`${open.length} waiting for seating`} />
            <Chip size="small" variant="outlined" label={`${ok.length} kept`} />
          </Stack>
        </Box>
        <Button
          size="small"
          onClick={() => setAll((a) => !a)}
          endIcon={all ? <ExpandLess /> : <ExpandMore />}
          aria-expanded={all}
        >
          {all ? "Show broken only" : `Show all ${results.length} rules`}
        </Button>
      </Stack>
      <Collapse in={shown.length > 0} unmountOnExit>
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0, mt: 1.5 }}>
          {shown.map((r) => (
            <Box
              component="li"
              key={r.index}
              sx={{
                display: "flex",
                gap: 1.25,
                alignItems: "flex-start",
                p: 1.25,
                borderRadius: 2,
                bgcolor: r.status === "broken" ? "action.hover" : "transparent",
                border: 1,
                borderColor: r.status === "broken" ? "error.main" : "divider",
              }}
            >
              <Box sx={{ pt: 0.25 }}>{statusIcon(r.status)}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">
                  {r.title}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                    {r.rule.note}
                  </Typography>
                </Typography>
                <Typography variant="body2">{r.message}</Typography>
              </Box>
              {r.status === "broken" && r.tableIds[0] && (
                <Button size="small" variant="outlined" color="inherit" onClick={() => onShow(r.tableIds[0] ?? "")}>
                  Show
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      </Collapse>
      {shown.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
          No rule is broken right now. Rules that wait on guests who are not seated yet are listed under &ldquo;Show all&rdquo;.
        </Typography>
      )}
    </Paper>
  );
}

function Legend() {
  return (
    <Stack
      direction="row"
      sx={{ mt: 1.5, flexWrap: "wrap", columnGap: 2, rowGap: 0.75, alignItems: "center" }}
      aria-label="Legend"
      component="ul"
    >
      {Object.entries(partyColors).map(([party, color]) => (
        <Box
          component="li"
          key={party}
          sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}
        >
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color }} />
          {party}
        </Box>
      ))}
      <Box component="li" sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "plan.diet" }} />
        Dietary need
      </Box>
      <Box component="li" sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}>
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", border: "2px dashed", borderColor: "text.disabled" }} />
        Empty seat
      </Box>
    </Stack>
  );
}

function UnseatedRow({
  guest,
  armed,
  startDrag,
  onArm,
}: {
  guest: Guest;
  armed: boolean;
  startDrag: StartDrag;
  onArm: (id: string) => void;
}) {
  return (
    <Box
      component="li"
      onPointerDown={(e) => startDrag(e, guest.id)}
      sx={{
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        pl: 0.5,
        pr: 1,
        py: 0.75,
        borderRadius: 2,
        border: 1,
        borderColor: armed ? "primary.main" : "divider",
        bgcolor: armed ? "action.selected" : "background.paper",
        touchAction: "pan-y",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <DragIndicator fontSize="small" sx={{ color: "text.disabled", touchAction: "none" }} aria-hidden="true" />
      <GuestDot guest={guest} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {guest.name}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.25 }}>
          <Typography variant="caption" color="text.secondary">
            {guest.party}
            {guest.rsvp !== "yes" ? ` · ${rsvpLabels[guest.rsvp]}` : ""}
          </Typography>
          {guest.diet && <DietChip diet={guest.diet} />}
        </Stack>
      </Box>
      <Button
        size="small"
        variant={armed ? "contained" : "outlined"}
        onClick={() => onArm(guest.id)}
        aria-pressed={armed}
        aria-label={`${armed ? "Cancel placing" : "Place"} ${guest.name}`}
        sx={{ minWidth: 64, flex: "none" }}
      >
        {armed ? "Placing" : "Place"}
      </Button>
    </Box>
  );
}

function UnseatedPanel({
  attending,
  unconfirmed,
  armedGuestId,
  startDrag,
  onArm,
  draggingSeated,
  dropActive,
}: {
  attending: Guest[];
  unconfirmed: Guest[];
  armedGuestId: string | null;
  startDrag: StartDrag;
  onArm: (id: string) => void;
  draggingSeated: boolean;
  dropActive: boolean;
}) {
  return (
    <Box
      data-drop-unseat=""
      sx={{
        p: 1.5,
        minHeight: 160,
        outline: draggingSeated ? "2px dashed" : "none",
        outlineOffset: -6,
        outlineColor: dropActive ? "primary.main" : "divider",
        bgcolor: dropActive ? "action.hover" : "transparent",
        borderRadius: 2,
      }}
    >
      {draggingSeated && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, textAlign: "center", py: 0.5 }}>
          Drop here to unseat
        </Typography>
      )}
      <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
        Attending, no seat yet ({attending.length})
      </Typography>
      {attending.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Everyone who is attending has a seat.
        </Typography>
      ) : (
        <Stack component="ul" spacing={0.75} sx={{ p: 0, m: 0, mb: 2 }}>
          {attending.map((g) => (
            <UnseatedRow key={g.id} guest={g} armed={armedGuestId === g.id} startDrag={startDrag} onArm={onArm} />
          ))}
        </Stack>
      )}
      <Typography variant="subtitle2" component="h3" sx={{ mb: 0.25 }}>
        Not confirmed ({unconfirmed.length})
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Maybe, or no reply yet. You can hold seats for them.
      </Typography>
      <Stack component="ul" spacing={0.75} sx={{ p: 0, m: 0 }}>
        {unconfirmed.map((g) => (
          <UnseatedRow key={g.id} guest={g} armed={armedGuestId === g.id} startDrag={startDrag} onArm={onArm} />
        ))}
      </Stack>
    </Box>
  );
}

function TablesPanel({
  selectedTableId,
  onSelect,
  seatedCount,
  brokenCount,
}: {
  selectedTableId: string | null;
  onSelect: (id: string) => void;
  seatedCount: (id: string) => number;
  brokenCount: (id: string) => number;
}) {
  return (
    <Stack component="ul" spacing={0.75} sx={{ p: 1.5, m: 0 }}>
      {tables.map((t) => {
        const n = seatedCount(t.id);
        const b = brokenCount(t.id);
        const sel = selectedTableId === t.id;
        return (
          <Box component="li" key={t.id} sx={{ listStyle: "none" }}>
            <Box
              component="button"
              type="button"
              onClick={() => onSelect(t.id)}
              aria-current={sel ? "true" : undefined}
              sx={{
                all: "unset",
                boxSizing: "border-box",
                width: "100%",
                cursor: "pointer",
                p: 1.25,
                borderRadius: 2,
                border: 1,
                borderColor: sel ? "primary.main" : "divider",
                bgcolor: sel ? "action.selected" : "background.paper",
                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                <Typography variant="subtitle2">{t.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  {b > 0 && <Chip size="small" color="error" variant="outlined" icon={<ErrorOutline />} label={`${b} broken`} />}
                  <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {n} / {t.seats}
                  </Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(n / t.seats) * 100}
                color={n === t.seats ? "success" : "primary"}
                aria-label={`${t.name} seats filled`}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {t.seats - n === 0 ? "Full" : `${t.seats - n} ${t.seats - n === 1 ? "seat" : "seats"} free`}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function TableDetails({
  tableId,
  focusGuestId,
  broken,
  onMove,
  onUnseat,
}: {
  tableId: string | null;
  focusGuestId: string | null;
  broken: RuleResult[];
  onMove: (guestId: string) => void;
  onUnseat: (guestId: string) => void;
}) {
  const { seats } = usePlan();
  const table = tableId ? tableById[tableId] : null;
  if (!table || !tableId) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Select a table on the plan to see who sits there and what they eat.
      </Typography>
    );
  }
  const row = seats[tableId] ?? [];
  const seated = row.map((id) => (id ? guestById[id] : undefined));
  const diets = new Map<string, number>();
  for (const g of seated) if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const count = seated.filter(Boolean).length;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
        <Typography variant="h6" component="h3">
          {table.name}
        </Typography>
        <Typography color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {count} of {table.seats} seats
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {table.shape === "long" ? "Long table" : "Round table"} at {table.x} m, {table.y} m.
      </Typography>

      {broken.map((r) => (
        <Alert key={r.index} severity="error" icon={<ErrorOutline />} sx={{ mb: 1.5 }}>
          <strong>{r.title}.</strong> {r.message}
        </Alert>
      ))}

      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        Dietary needs at this table
      </Typography>
      {diets.size === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          None noted.
        </Typography>
      ) : (
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {[...diets.entries()].map(([d, n]) => (
            <Chip key={d} size="small" variant="outlined" color={d.toLowerCase().includes("allergy") ? "error" : "warning"} label={`${n} × ${d}`} />
          ))}
        </Stack>
      )}

      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        Seats
      </Typography>
      <Stack component="ol" spacing={0.5} sx={{ p: 0, m: 0 }}>
        {row.map((id, i) => {
          const g = id ? guestById[id] : undefined;
          return (
            <Box
              component="li"
              key={i}
              sx={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1,
                py: 0.75,
                minHeight: 52,
                borderRadius: 2,
                border: 1,
                borderStyle: g ? "solid" : "dashed",
                borderColor: g && g.id === focusGuestId ? "primary.main" : "divider",
                bgcolor: g && g.id === focusGuestId ? "action.selected" : "transparent",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: 16, textAlign: "right", fontVariantNumeric: "tabular-nums", flex: "none" }}
              >
                {i + 1}
              </Typography>
              {g ? (
                <>
                  <GuestDot guest={g} size={30} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {g.name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {g.party}
                      </Typography>
                      {g.diet && <DietChip diet={g.diet} />}
                    </Stack>
                  </Box>
                  <IconButton size="small" onClick={() => onMove(g.id)} aria-label={`Move ${g.name} to another table`}>
                    <SwapHoriz fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onUnseat(g.id)} aria-label={`Unseat ${g.name}`}>
                    <PersonRemoveOutlined fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Empty seat
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function PlacingBar({
  guest,
  currentTable,
  seatedCount,
  onPick,
  onCancel,
}: {
  guest: Guest;
  currentTable: string | null;
  seatedCount: (id: string) => number;
  onPick: (tableId: string) => void;
  onCancel: () => void;
}) {
  return (
    <Paper
      role="region"
      aria-label="Placing a guest"
      sx={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        px: 1.5,
        py: 1,
        maxWidth: 720,
        width: "100%",
        boxShadow: 8,
        border: 2,
        borderColor: "primary.main",
      }}
    >
      <GuestDot guest={guest} size={34} />
      <Box sx={{ flex: "1 1 160px", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {currentTable ? "Moving" : "Placing"} {guest.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Tap a table or an empty seat on the plan
        </Typography>
      </Box>
      <TextField
        select
        size="small"
        label="Or choose a table"
        value=""
        onChange={(e) => onPick(e.target.value)}
        sx={{ minWidth: 170 }}
        slotProps={{ select: { displayEmpty: false } }}
      >
        {tables.map((t) => {
          const free = t.seats - seatedCount(t.id);
          return (
            <MenuItem key={t.id} value={t.id} disabled={free === 0 || t.id === currentTable}>
              {t.name} ({free} free)
            </MenuItem>
          );
        })}
      </TextField>
      <Button onClick={onCancel} startIcon={<Close />} color="inherit">
        Cancel
      </Button>
    </Paper>
  );
}
```

```ts components/useGuestDrag.ts
"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type DropTarget =
  | { type: "seat"; tableId: string; seat: number }
  | { type: "table"; tableId: string }
  | { type: "unseat" }
  | null;

export interface DragState {
  guestId: string;
  x: number;
  y: number;
  target: DropTarget;
}

export type StartDrag = (e: ReactPointerEvent, guestId: string) => void;

function hitTest(x: number, y: number): DropTarget {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    const seat = el.closest<HTMLElement>("[data-seat-table]");
    if (seat?.dataset.seatTable) {
      return { type: "seat", tableId: seat.dataset.seatTable, seat: Number(seat.dataset.seatIndex ?? 0) };
    }
    const table = el.closest<HTMLElement>("[data-drop-table]");
    if (table?.dataset.dropTable) return { type: "table", tableId: table.dataset.dropTable };
    if (el.closest("[data-drop-unseat]")) return { type: "unseat" };
  }
  return null;
}

/**
 * Pointer-based drag and drop for guests (mouse, pen and touch). A drag starts after the pointer
 * has moved a few pixels, so plain taps and clicks keep working.
 */
export function useGuestDrag(onDrop: (guestId: string, target: DropTarget) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const onDropRef = useRef(onDrop);
  useEffect(() => {
    onDropRef.current = onDrop;
  });
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const startDrag = useCallback<StartDrag>((e, guestId) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cleanupRef.current?.();
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    let active = false;

    const swallowClick = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
        active = true;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }
      setDrag({ guestId, x: ev.clientX, y: ev.clientY, target: hitTest(ev.clientX, ev.clientY) });
    };

    const finish = (ev: PointerEvent | null) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      cleanupRef.current = null;
      if (active) {
        setDrag(null);
        window.addEventListener("click", swallowClick, true);
        setTimeout(() => window.removeEventListener("click", swallowClick, true), 60);
        if (ev) onDropRef.current(guestId, hitTest(ev.clientX, ev.clientY));
      }
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(ev);
    };
    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    cleanupRef.current = () => finish(null);
  }, []);

  return { drag, startDrag };
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type TableShape = "round" | "long";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type RuleKind = "together" | "apart" | "near";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface PlanTable {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Rule {
  kind: RuleKind;
  guests: string[];
  note: string;
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

export const tables: PlanTable[] = [
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
  },
];

export const rsvpLabels: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

// Colours come from the theme's `party` palette (see app/theme.ts).
const partyVar = (key: string) => `var(--mui-palette-party-${key})`;
export const partyColors: Record<string, string> = {
  Couple: partyVar("couple"),
  "Bride's family": partyVar("bride"),
  "Groom's family": partyVar("groom"),
  "University friends": partyVar("university"),
  "Work friends": partyVar("work"),
  "Groom's football club": partyVar("football"),
  "Plus-ones": partyVar("plusones"),
};
export const FALLBACK_PARTY_COLOR = partyVar("plusones");

export const parties: string[] = Object.keys(partyColors);

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, PlanTable> = Object.fromEntries(tables.map((t) => [t.id, t]));

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 2027, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
```

```ts lib/geometry.ts
import type { PlanTable } from "./data";

/** Seat radius in metres, as drawn on the plan. */
export const SEAT_R = 0.4;

export interface SeatSpot {
  /** Position relative to the table centre, in metres. */
  x: number;
  y: number;
  /** Unit vector pointing away from the table, used to place name labels. */
  dx: number;
  dy: number;
}

export function roundBodyRadius(t: PlanTable): number {
  return t.seats > 6 ? 0.82 : 0.72;
}

export function seatRingRadius(t: PlanTable): number {
  return roundBodyRadius(t) + SEAT_R + 0.08;
}

export const LONG_W = 5.8;
export const LONG_H = 1.0;

/** Outer radius of everything belonging to a table (seats included), for rings and hit areas. */
export function tableReach(t: PlanTable): number {
  if (t.shape === "round") return seatRingRadius(t) + SEAT_R;
  return Math.hypot(LONG_W / 2, LONG_H / 2 + SEAT_R * 2);
}

export function seatSpots(t: PlanTable): SeatSpot[] {
  if (t.shape === "round") {
    const r = seatRingRadius(t);
    return Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, dx: Math.cos(a), dy: Math.sin(a) };
    });
  }
  const perSide = Math.ceil(t.seats / 2);
  const gap = (LONG_W - 0.9) / perSide;
  const yOff = LONG_H / 2 + SEAT_R + 0.08;
  return Array.from({ length: t.seats }, (_, i) => {
    const top = i < perSide;
    const k = top ? i : i - perSide;
    const x = (k - (perSide - 1) / 2) * gap;
    return { x, y: top ? -yOff : yOff, dx: 0, dy: top ? -1 : 1 };
  });
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { guestById, guests, tableById, tables } from "./data";
import { evaluateRules, tableOf, type RuleResult, type SeatMap } from "./rules";

export interface PlaceResult {
  ok: boolean;
  message: string;
}

interface PlanContextValue {
  seats: SeatMap;
  /** guest id -> table id (null when unseated) */
  tableOfGuest: (guestId: string) => string | null;
  seatedCount: (tableId: string) => number;
  place: (guestId: string, tableId: string, seatIndex?: number) => PlaceResult;
  unseat: (guestId: string) => PlaceResult;
  ruleResults: RuleResult[];
  /** table id -> broken rule results touching it */
  brokenByTable: Record<string, RuleResult[]>;
  totals: {
    capacity: number;
    seated: number;
    attending: number;
    attendingUnseated: number;
    unconfirmedSeated: number;
  };
}

const PlanContext = createContext<PlanContextValue | null>(null);

function initialSeats(): SeatMap {
  const map: SeatMap = {};
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = map[g.table];
    if (!row) continue;
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return map;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  // Latest seats for callbacks used from window-level pointer listeners.
  const seatsRef = useRef(seats);
  seatsRef.current = seats;

  const place = useCallback((guestId: string, tableId: string, seatIndex?: number): PlaceResult => {
    const current = seatsRef.current;
    const guest = guestById[guestId];
    const table = tableById[tableId];
    const row = current[tableId];
    if (!guest || !table || !row) return { ok: false, message: "That seat is not available." };
    if (guest.rsvp === "no") {
      return { ok: false, message: `${guest.name} has declined, so they cannot be seated.` };
    }
    const currentTable = tableOf(current, guestId);
    const currentSeat = currentTable ? (current[currentTable] ?? []).indexOf(guestId) : -1;

    let target = -1;
    if (seatIndex !== undefined && row[seatIndex] === null) target = seatIndex;
    if (target < 0 && currentTable === tableId) {
      return { ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    if (target < 0) target = row.indexOf(null);
    if (target < 0) return { ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats taken).` };

    const next: SeatMap = { ...current };
    if (currentTable) {
      const oldRow = [...(next[currentTable] ?? [])];
      oldRow[currentSeat] = null;
      next[currentTable] = oldRow;
    }
    const newRow = currentTable === tableId ? [...(next[tableId] ?? [])] : [...row];
    newRow[target] = guestId;
    next[tableId] = newRow;
    seatsRef.current = next;
    setSeats(next);
    const verb = currentTable && currentTable !== tableId ? "moved to" : "seated at";
    return { ok: true, message: `${guest.name} ${verb} ${table.name}, seat ${target + 1}.` };
  }, []);

  const unseat = useCallback((guestId: string): PlaceResult => {
    const current = seatsRef.current;
    const guest = guestById[guestId];
    const t = tableOf(current, guestId);
    if (!guest || !t) return { ok: false, message: "That guest has no seat." };
    const row = (current[t] ?? []).map((id) => (id === guestId ? null : id));
    const next = { ...current, [t]: row };
    seatsRef.current = next;
    setSeats(next);
    return { ok: true, message: `${guest.name} unseated from ${tableById[t]?.name ?? t}.` };
  }, []);

  const value = useMemo<PlanContextValue>(() => {
    const ruleResults = evaluateRules(seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    for (const r of ruleResults) {
      if (r.status !== "broken") continue;
      for (const id of r.tableIds) (brokenByTable[id] ??= []).push(r);
    }
    let seated = 0;
    let unconfirmedSeated = 0;
    for (const row of Object.values(seats)) {
      for (const id of row) {
        if (!id) continue;
        seated += 1;
        if (guestById[id]?.rsvp !== "yes") unconfirmedSeated += 1;
      }
    }
    const attending = guests.filter((g) => g.rsvp === "yes").length;
    const attendingSeated = seated - unconfirmedSeated;
    return {
      seats,
      tableOfGuest: (id) => tableOf(seats, id),
      seatedCount: (tableId) => (seats[tableId] ?? []).filter(Boolean).length,
      place,
      unseat,
      ruleResults,
      brokenByTable,
      totals: {
        capacity: tables.reduce((n, t) => n + t.seats, 0),
        seated,
        attending,
        attendingUnseated: attending - attendingSeated,
        unconfirmedSeated,
      },
    };
  }, [seats, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/rules.ts
import { fixtures, guestById, rules, tableById, type Rule } from "./data";

/** tableId -> seat list (index = seat, value = guest id or null). */
export type SeatMap = Record<string, (string | null)[]>;

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  title: string;
  status: RuleStatus;
  message: string;
  /** Tables to flag when the rule is broken. */
  tableIds: string[];
}

/** A table counts as "near" the garden doors within this distance (m), and "away" from the band beyond it. */
export const NEAR_LIMIT_M = 4.5;
export const AWAY_LIMIT_M = 6;

export function tableOf(seats: SeatMap, guestId: string): string | null {
  for (const [tableId, row] of Object.entries(seats)) {
    if (row.includes(guestId)) return tableId;
  }
  return null;
}

function fixtureCentre(kind: "door" | "stage"): { x: number; y: number } {
  const f = fixtures.find((fx) => fx.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceTo(tableId: string, kind: "door" | "stage"): number {
  const t = tableById[tableId];
  if (!t) return 0;
  const c = fixtureCentre(kind);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

const TITLES: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near the garden doors",
};

function nameOf(id: string): string {
  return guestById[id]?.name ?? id;
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

function evaluate(rule: Rule, index: number, seats: SeatMap): RuleResult {
  const base = { index, rule, title: TITLES[rule.kind] };

  if (rule.kind === "near") {
    const id = rule.guests[0] ?? "";
    const t = tableOf(seats, id);
    if (!t) {
      return { ...base, status: "open", message: `${nameOf(id)} is not seated yet.`, tableIds: [] };
    }
    const door = distanceTo(t, "door");
    const band = distanceTo(t, "stage");
    if (door <= NEAR_LIMIT_M && band >= AWAY_LIMIT_M) {
      return {
        ...base,
        status: "ok",
        message: `${nameOf(id)} is at ${tableName(t)}, ${door.toFixed(1)} m from the garden doors and ${band.toFixed(1)} m from the band.`,
        tableIds: [t],
      };
    }
    const why =
      door > NEAR_LIMIT_M
        ? `${door.toFixed(1)} m from the garden doors (aim for ${NEAR_LIMIT_M} m or less)`
        : `only ${band.toFixed(1)} m from the band (aim for ${AWAY_LIMIT_M} m or more)`;
    return {
      ...base,
      status: "broken",
      message: `${nameOf(id)} is at ${tableName(t)}, ${why}.`,
      tableIds: [t],
    };
  }

  const [a = "", b = ""] = rule.guests;
  const ta = tableOf(seats, a);
  const tb = tableOf(seats, b);

  if (rule.kind === "together") {
    if (ta && tb) {
      if (ta === tb) {
        return { ...base, status: "ok", message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`, tableIds: [ta] };
      }
      return {
        ...base,
        status: "broken",
        message: `${nameOf(a)} is at ${tableName(ta)} but ${nameOf(b)} is at ${tableName(tb)}.`,
        tableIds: [ta, tb],
      };
    }
    const missing = !ta && !tb ? `${nameOf(a)} and ${nameOf(b)} are not seated yet.` : `${nameOf(ta ? b : a)} is not seated yet.`;
    return { ...base, status: "open", message: missing, tableIds: [] };
  }

  // apart
  if (ta && tb) {
    if (ta === tb) {
      return {
        ...base,
        status: "broken",
        message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`,
        tableIds: [ta],
      };
    }
    return {
      ...base,
      status: "ok",
      message: `${nameOf(a)} (${tableName(ta)}) and ${nameOf(b)} (${tableName(tb)}) are apart.`,
      tableIds: [],
    };
  }
  const waiting = !ta && !tb ? `${nameOf(a)} and ${nameOf(b)} are not seated yet.` : `${nameOf(ta ? b : a)} is not seated yet.`;
  return { ...base, status: "open", message: waiting, tableIds: [] };
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return rules.map((r, i) => evaluate(r, i, seats));
}
```

