"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { event, fixtures, tables, type Fixture, type Table } from "@/lib/data";
import { PARTIES, SEAT_M, guestById, initials, partyColor, tableGeometry } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const px = (v: number) => `${(v / W) * 100}%`;
const py = (v: number) => `${(v / D) * 100}%`;

function activate(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

function FixtureView({ f }: { f: Fixture }) {
  const base = {
    position: "absolute" as const,
    left: px(f.x),
    top: py(f.y),
    width: px(f.w),
    height: py(f.h),
    display: "grid",
    placeItems: "center",
    textAlign: "center" as const,
    fontSize: "max(9px, 1.05cqw)",
    fontWeight: 600,
    lineHeight: 1.1,
    pointerEvents: "none" as const,
  };
  if (f.kind === "stage") {
    return (
      <Box sx={{ ...base, bgcolor: "secondary.main", color: "secondary.contrastText", borderRadius: 1 }}>{f.label}</Box>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <Box
        sx={{
          ...base,
          backgroundColor: "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
          border: "1.5px dashed",
          borderColor: "primary.main",
          color: "primary.main",
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {f.label}
      </Box>
    );
  }
  if (f.kind === "bar") {
    return (
      <Box sx={{ ...base, bgcolor: "action.selected", border: 1, borderColor: "divider", borderRadius: 1, color: "text.primary" }}>
        {f.label}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        ...base,
        borderLeft: "4px solid",
        borderColor: "secondary.main",
        bgcolor: "color-mix(in srgb, var(--mui-palette-secondary-main) 18%, transparent)",
        color: "text.primary",
        writingMode: "vertical-rl",
        fontSize: "max(8px, 0.9cqw)",
      }}
    >
      {f.label}
    </Box>
  );
}

function Seat({ table, idx, x, y }: { table: Table; idx: number; x: number; y: number }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const gid = plan.seats[table.id]?.[idx] ?? null;
  const guest = gid ? guestById[gid] : null;
  const isPicked = gid !== null && plan.picked === gid;
  const flagged = gid !== null && plan.brokenGuests.has(gid);

  const tap = () => {
    if (plan.picked) {
      if (plan.picked === gid) {
        plan.pick(null);
        return;
      }
      plan.place(plan.picked, table.id, idx);
      return;
    }
    plan.selectTable(table.id);
    if (gid) plan.pick(gid);
  };

  const label = guest
    ? `${table.name}, seat ${idx + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}. ${plan.picked ? "Place or swap here" : "Pick up"}`
    : `${table.name}, seat ${idx + 1}: empty${plan.picked ? ". Place the picked guest here" : ""}`;

  const shadows: string[] = [];
  if (isPicked) shadows.push("0 0 0 3px var(--mui-palette-primary-main)");
  if (flagged) shadows.push("0 0 0 2px var(--mui-palette-error-main)");
  if (over) shadows.push("0 0 0 4px var(--mui-palette-primary-main)");

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `${table.name}, seat ${idx + 1} (empty)`}
      draggable={Boolean(guest)}
      onClick={tap}
      onKeyDown={(e: KeyboardEvent) => activate(e, tap)}
      onDragStart={(e: DragEvent) => {
        if (!gid) return;
        e.dataTransfer.setData("text/plain", gid);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(gid);
      }}
      onDragEnd={() => plan.setDragId(null)}
      onDragOver={(e: DragEvent) => {
        if (!plan.dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        if (plan.dragId) plan.place(plan.dragId, table.id, idx);
        plan.setDragId(null);
      }}
      sx={{
        position: "absolute",
        left: px(x),
        top: py(y),
        width: px(SEAT_M),
        height: py(SEAT_M),
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: "max(8px, 1cqw)",
        fontWeight: 700,
        lineHeight: 1,
        userSelect: "none",
        cursor: guest ? "grab" : "pointer",
        color: "#fff",
        bgcolor: guest ? partyColor(guest.party) : over ? "action.hover" : "background.paper",
        border: guest ? "2px solid" : "1.5px dashed",
        borderColor: guest ? "background.paper" : over ? "primary.main" : "text.disabled",
        boxShadow: shadows.join(", ") || "none",
        zIndex: isPicked || over ? 3 : 2,
        "&:hover": { borderColor: "primary.main" },
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 2 },
      }}
    >
      {guest ? initials(guest.name) : null}
      {guest?.diet ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: "-8%",
            bottom: "-8%",
            width: "38%",
            height: "38%",
            borderRadius: "50%",
            bgcolor: "#f2a900",
            border: "1.5px solid",
            borderColor: "background.paper",
          }}
        />
      ) : null}
    </Box>
  );
}

function TableView({ table }: { table: Table }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const geo = tableGeometry(table);
  const count = plan.occupied[table.id] ?? 0;
  const problems = plan.brokenByTable[table.id] ?? [];
  const selected = plan.selectedTable === table.id;
  const tap = () => {
    if (plan.picked) {
      plan.place(plan.picked, table.id);
      return;
    }
    plan.selectTable(table.id);
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats taken${problems.length ? `, ${problems.length} broken ${problems.length === 1 ? "rule" : "rules"}` : ""}. ${plan.picked ? "Seat the picked guest here" : "Show guests"}`}
        onClick={tap}
        onKeyDown={(e: KeyboardEvent) => activate(e, tap)}
        onDragOver={(e: DragEvent) => {
          if (!plan.dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (!over) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setOver(false);
          if (plan.dragId) plan.place(plan.dragId, table.id);
          plan.setDragId(null);
        }}
        sx={{
          position: "absolute",
          left: px(geo.centre.x),
          top: py(geo.centre.y),
          width: px(geo.w),
          height: py(geo.h),
          transform: "translate(-50%, -50%)",
          borderRadius: table.shape === "round" ? "50%" : "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          zIndex: 1,
          bgcolor: over ? "action.hover" : "background.paper",
          border: problems.length ? "3px solid" : "2px solid",
          borderColor: problems.length ? "error.main" : selected || over ? "primary.main" : "text.secondary",
          boxShadow: selected ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)" : "none",
          fontSize: "max(9px, 1.05cqw)",
          lineHeight: 1.2,
          "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 3 },
        }}
      >
        <Box component="span" sx={{ fontWeight: 800 }}>
          {table.name}
        </Box>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {count}/{table.seats} seats
        </Box>
        {problems.length ? (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: "-12%",
              right: table.shape === "round" ? "-8%" : "-1%",
              width: "max(16px, 1.7cqw)",
              height: "max(16px, 1.7cqw)",
              borderRadius: "50%",
              bgcolor: "error.main",
              color: "error.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: "max(12px, 1.2cqw)" }} />
          </Box>
        ) : null}
      </Box>
      {geo.seats.map((p, i) => (
        <Seat key={i} table={table} idx={i} x={p.x} y={p.y} />
      ))}
    </>
  );
}

const legendItem = { alignItems: "center" } as const;

export default function RoomPlan() {
  return (
    <Box component="section" aria-labelledby="room-heading">
      <Stack direction="row" sx={{ mb: 1, flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" }}>
        <Typography id="room-heading" variant="h2" component="h2">
          {event.venue}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Room {W} × {D} m, drawn to scale. Grid squares are 1 m.
        </Typography>
      </Stack>
      <Box
        role="region"
        aria-label={`Room plan, ${W} by ${D} metres. Scrolls sideways on narrow screens.`}
        tabIndex={0}
        sx={{ overflowX: "auto", border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Box
          sx={{
            position: "relative",
            minWidth: 780,
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            color: "text.primary",
            backgroundImage:
              "linear-gradient(color-mix(in srgb, currentColor 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, currentColor 7%, transparent) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {fixtures.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableView key={t.id} table={t} />
          ))}
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={2}
        component="ul"
        aria-label="Legend"
        sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1, listStyle: "none", p: 0, mb: 0 }}
      >
        {PARTIES.map((p) => (
          <Stack component="li" key={p} direction="row" spacing={0.75} sx={legendItem}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: partyColor(p) }} />
            <Typography variant="caption">{p}</Typography>
          </Stack>
        ))}
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f2a900" }} />
          <Typography variant="caption">Dietary need</Typography>
        </Stack>
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.disabled" }} />
          <Typography variant="caption">Empty seat</Typography>
        </Stack>
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", boxShadow: "0 0 0 2px var(--mui-palette-error-main)" }} />
          <Typography variant="caption">Breaks a rule</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
