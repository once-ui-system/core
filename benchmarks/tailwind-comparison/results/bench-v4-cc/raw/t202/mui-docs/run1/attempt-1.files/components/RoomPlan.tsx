"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LocalBar from "@mui/icons-material/LocalBar";
import MusicNote from "@mui/icons-material/MusicNote";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { EVENT, FIXTURES, PARTIES, TABLES, guestById, initials, type Fixture, type TableDef } from "@/lib/data";
import { SEAT_D, tableGeometry } from "@/lib/seating";
import { STRONG_BORDER, partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const W = EVENT.room.width;
const D = EVENT.room.depth;

// Everything is placed in room metres and turned into percentages of the room,
// so the plan scales with its container. Text sizes use container query units (1 m = 100cqw / W).
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / D) * 100}%`;
const pw = (w: number) => `${(w / W) * 100}%`;
const ph = (h: number) => `${(h / D) * 100}%`;
const fs = (m: number, min: number, max: number) => `clamp(${min}px, calc(${m} * 100cqw / ${W}), ${max}px)`;

const FIXTURE_BG: Record<Fixture["kind"], string> = {
  stage: tint("secondary-main", 22),
  dancefloor: tint("primary-main", 9),
  bar: tint("text-primary", 12),
  door: "var(--mui-palette-success-main)",
};
const FIXTURE_BORDER: Record<Fixture["kind"], string> = {
  stage: "1.5px solid var(--mui-palette-secondary-main)",
  dancefloor: "1.5px dashed var(--mui-palette-primary-main)",
  bar: `1.5px solid ${STRONG_BORDER}`,
  door: "none",
};

function FixtureNode({ f }: { f: Fixture }) {
  return (
    <Box
      role="img"
      aria-label={f.label}
      sx={{
        position: "absolute",
        left: px(f.x),
        top: py(f.y),
        width: pw(f.w),
        height: ph(f.h),
        boxSizing: "border-box",
        display: "flex",
        flexDirection: f.kind === "dancefloor" ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        overflow: "hidden",
        textAlign: "center",
        fontSize: fs(0.3, 9, 14),
        fontWeight: 600,
        lineHeight: 1.1,
        borderRadius: f.kind === "door" ? 0 : fs(0.2, 3, 8),
        bgcolor: FIXTURE_BG[f.kind],
        border: FIXTURE_BORDER[f.kind],
        color: f.kind === "door" ? "var(--mui-palette-success-contrastText)" : "text.primary",
        writingMode: f.kind === "door" ? "vertical-rl" : "horizontal-tb",
        transform: f.kind === "door" ? "rotate(180deg)" : "none",
        pointerEvents: "none",
      }}
    >
      {f.kind === "stage" ? <MusicNote fontSize="inherit" /> : null}
      {f.kind === "bar" ? <LocalBar fontSize="inherit" /> : null}
      <span>{f.label}</span>
    </Box>
  );
}

function draggedId(plan: ReturnType<typeof usePlan>, e: React.DragEvent): string | null {
  const id = plan.dragging ?? e.dataTransfer.getData("text/plain");
  return id && guestById[id] ? id : null;
}

interface NodeProps {
  table: TableDef;
  over: string | null;
  setOver: (key: string | null) => void;
}

function TableNode({ table, over, setOver }: NodeProps) {
  const plan = usePlan();
  const geo = React.useMemo(() => tableGeometry(table), [table]);
  const row = plan.state.seats[table.id];
  const filled = plan.tableFill[table.id];
  const selected = plan.state.selectedTable === table.id;
  const armedId = plan.state.armed;
  const broken = plan.brokenByTable[table.id] ?? [];
  const tableOver = over === table.id;

  const onTable = () => {
    if (armedId) plan.place(armedId, table.id);
    else plan.selectTable(selected ? null : table.id);
  };

  const label =
    `${table.name}, ${filled} of ${row.length} seats filled` +
    (broken.length ? `, ${broken.length} seating rule${broken.length > 1 ? "s" : ""} broken` : "") +
    (selected ? ", selected" : "");

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={label}
        onClick={onTable}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTable();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (over !== table.id) setOver(table.id);
        }}
        onDragLeave={() => setOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          const id = draggedId(plan, e);
          setOver(null);
          plan.setDragging(null);
          if (id) plan.place(id, table.id);
        }}
        sx={{
          position: "absolute",
          left: px(table.x),
          top: py(table.y),
          width: pw(geo.w),
          height: ph(geo.h),
          transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
          boxSizing: "border-box",
          borderRadius: geo.round ? "50%" : fs(0.18, 4, 9),
          bgcolor: tableOver ? tint("primary-main", 22) : "background.paper",
          border: "2.5px solid",
          borderColor: broken.length ? "error.main" : selected || tableOver ? "primary.main" : STRONG_BORDER,
          boxShadow: broken.length
            ? "0 0 0 3px color-mix(in srgb, var(--mui-palette-error-main) 28%, transparent)"
            : selected
              ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)"
              : "0 1px 2px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: 1.15,
          cursor: armedId ? "copy" : "pointer",
          zIndex: 1,
          "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 3 },
        }}
      >
        <Box component="span" sx={{ fontSize: fs(0.31, 9, 14), fontWeight: 700 }}>
          {table.name}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: fs(0.28, 9, 13),
            color: broken.length ? "error.main" : "text.secondary",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            fontWeight: 600,
          }}
        >
          {broken.length ? <WarningAmber sx={{ fontSize: "1.15em" }} /> : null}
          {filled}/{row.length}
        </Box>
      </Box>

      {geo.seats.map((pos) => {
        const gid = row[pos.index];
        const guest = gid ? guestById[gid] : null;
        const c = guest ? partyColor(guest.party) : null;
        const isArmed = gid !== null && plan.state.armed === gid;
        const flagged = gid !== null && plan.brokenGuests.has(gid);
        const key = `${table.id}:${pos.index}`;
        const isOver = over === key;

        const onSeat = () => {
          if (gid) {
            if (armedId && armedId !== gid) plan.place(armedId, table.id, pos.index);
            else if (armedId === gid) plan.arm(null);
            else plan.arm(gid);
          } else if (armedId) {
            plan.place(armedId, table.id, pos.index);
          } else {
            plan.selectTable(table.id);
          }
        };

        return (
          <Box
            key={key}
            role="button"
            tabIndex={0}
            aria-pressed={guest ? isArmed : undefined}
            aria-label={
              guest
                ? `${table.name}, seat ${pos.index + 1}: ${guest.name}, ${guest.party}, ${guest.diet ?? "no dietary needs"}${
                    flagged ? ", breaks a seating rule" : ""
                  }`
                : `${table.name}, seat ${pos.index + 1}: empty`
            }
            title={guest ? `${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${pos.index + 1} (empty)`}
            draggable={guest !== null}
            onClick={onSeat}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSeat();
              }
            }}
            onDragStart={(e) => {
              if (!gid) return;
              e.dataTransfer.setData("text/plain", gid);
              e.dataTransfer.effectAllowed = "move";
              plan.setDragging(gid);
            }}
            onDragEnd={() => {
              plan.setDragging(null);
              setOver(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              if (over !== key) setOver(key);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const id = draggedId(plan, e);
              setOver(null);
              plan.setDragging(null);
              if (id) plan.place(id, table.id, pos.index);
            }}
            sx={{
              position: "absolute",
              left: px(pos.x - SEAT_D / 2),
              top: py(pos.y - SEAT_D / 2),
              width: pw(SEAT_D),
              height: ph(SEAT_D),
              boxSizing: "border-box",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: fs(0.27, 8, 12),
              fontWeight: 700,
              userSelect: "none",
              cursor: guest ? "grab" : armedId ? "copy" : "pointer",
              zIndex: 2,
              bgcolor: isOver ? tint("primary-main", 35) : c ? c.tint : "transparent",
              border: c ? `2px solid ${c.solid}` : "1.5px dashed color-mix(in srgb, var(--mui-palette-text-primary) 45%, transparent)",
              color: "text.primary",
              boxShadow: isOver
                ? "0 0 0 3px var(--mui-palette-primary-main)"
                : flagged
                  ? "0 0 0 2.5px var(--mui-palette-error-main)"
                  : "none",
              outline: isArmed ? "3px solid var(--mui-palette-primary-main)" : "none",
              outlineOffset: 2,
              transform: isArmed ? "scale(1.15)" : "none",
              transition: "transform 120ms, box-shadow 120ms",
              "&:hover": { bgcolor: c ? c.tint : tint("primary-main", 16) },
              "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 2 },
            }}
          >
            {guest ? initials(guest.name) : <Box component="span" aria-hidden sx={{ color: "text.disabled" }}>+</Box>}
            {guest && guest.diet ? (
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: "absolute",
                  right: "-8%",
                  bottom: "-8%",
                  width: "34%",
                  height: "34%",
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                  border: "1.5px solid var(--mui-palette-background-paper)",
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </>
  );
}

const legendItemSx = { display: "flex", alignItems: "center", gap: 0.75, listStyle: "none" } as const;

export default function RoomPlan() {
  const [over, setOver] = React.useState<string | null>(null);

  return (
    <Paper variant="outlined" component="section" aria-labelledby="plan-title" sx={{ p: { xs: 1.5, md: 2 }, overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 0.5 }}>
        <Typography id="plan-title" variant="h6" component="h2">
          Room plan
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {EVENT.venue} · {W} × {D} m · grid squares are 1 m
        </Typography>
      </Box>

      <Box
        role="region"
        aria-label="Room plan. On narrow screens it scrolls sideways."
        tabIndex={0}
        sx={{ overflowX: "auto", mt: 1.5, borderRadius: 1.5, "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)" } }}
      >
        <Box sx={{ minWidth: 880, containerType: "inline-size" }}>
          <Box
            sx={{
              position: "relative",
              aspectRatio: `${W} / ${D}`,
              border: "3px solid",
              borderColor: "text.secondary",
              borderRadius: 1,
              bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))",
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--mui-palette-text-primary) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--mui-palette-text-primary) 7%, transparent) 1px, transparent 1px)",
              backgroundSize: `calc(100cqw / ${W}) calc(100cqw / ${W})`,
            }}
          >
            {FIXTURES.map((f) => (
              <FixtureNode key={f.id} f={f} />
            ))}
            {TABLES.map((t) => (
              <TableNode key={t.id} table={t} over={over} setOver={setOver} />
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="ul"
        aria-label="Legend"
        sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1.5, alignItems: "center", m: 0, p: 0, pt: 1.5 }}
      >
        {PARTIES.map((p) => {
          const c = partyColor(p);
          return (
            <Box key={p} component="li" sx={legendItemSx}>
              <Box aria-hidden sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: c.tint, border: `2px solid ${c.solid}` }} />
              <Typography variant="caption">{p}</Typography>
            </Box>
          );
        })}
        <Box component="li" sx={legendItemSx}>
          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "warning.main" }} />
          <Typography variant="caption">Dietary need</Typography>
        </Box>
        <Box component="li" sx={legendItemSx}>
          <Box aria-hidden sx={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.secondary" }} />
          <Typography variant="caption">Empty seat</Typography>
        </Box>
      </Box>
      <Typography variant="caption" component="p" sx={{ mt: 1, color: "text.secondary" }}>
        Drag a guest onto a seat or table, or tap a guest and then tap where they should sit.
      </Typography>
    </Paper>
  );
}

/** One chip per table: counts at a glance, and a large target for tapping or dropping a guest. */
export function TableStrip() {
  const plan = usePlan();
  const [over, setOver] = React.useState<string | null>(null);
  const armedId = plan.state.armed;

  return (
    <Box
      component="ul"
      aria-label="Tables"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, m: 0, p: 0, listStyle: "none" }}
    >
      {TABLES.map((t) => {
        const filled = plan.tableFill[t.id];
        const full = filled >= t.seats;
        const broken = (plan.brokenByTable[t.id] ?? []).length > 0;
        const selected = plan.state.selectedTable === t.id;
        return (
          <li key={t.id}>
            <Chip
              clickable
              onClick={() => {
                if (armedId) plan.place(armedId, t.id);
                else plan.selectTable(selected ? null : t.id);
              }}
              onDragOver={(e: React.DragEvent) => {
                e.preventDefault();
                setOver(t.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e: React.DragEvent) => {
                e.preventDefault();
                const id = draggedId(plan, e);
                setOver(null);
                plan.setDragging(null);
                if (id) plan.place(id, t.id);
              }}
              variant={selected || over === t.id ? "filled" : "outlined"}
              color={broken ? "error" : selected || over === t.id ? "primary" : "default"}
              icon={broken ? <WarningAmber /> : undefined}
              aria-label={`${t.name}, ${filled} of ${t.seats} seats${full ? ", full" : ""}${broken ? ", rule broken" : ""}`}
              aria-pressed={selected}
              label={`${t.name} · ${filled}/${t.seats}`}
              sx={{ height: 40, borderRadius: 20, fontWeight: 600, px: 0.5 }}
            />
          </li>
        );
      })}
    </Box>
  );
}
