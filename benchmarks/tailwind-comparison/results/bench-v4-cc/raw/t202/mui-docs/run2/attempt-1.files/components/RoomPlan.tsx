"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Stack from "@/lib/stack";
import {
  event,
  fixtures,
  guestById,
  initials,
  parties,
  partyColor,
  tables,
  type Fixture,
  type Guest,
  type Table,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";

const W = event.room_m.width;
const H = event.room_m.depth;
const SEAT = 1.0;

type Geometry = { w: number; h: number; body: { w: number; h: number }; seats: { x: number; y: number }[] };

function geometry(table: Table): Geometry {
  if (table.shape === "round") {
    const R = 1.5;
    const w = 2 * (R + SEAT / 2);
    const seats = Array.from({ length: table.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      return { x: R * Math.cos(a), y: R * Math.sin(a) };
    });
    return { w, h: w, body: { w: 1.7, h: 1.7 }, seats };
  }
  const top = Math.ceil(table.seats / 2);
  const bottom = table.seats - top;
  const width = 4.6;
  const offset = 1.1;
  const row = (count: number, y: number) =>
    Array.from({ length: count }, (_, k) => ({ x: -width / 2 + ((k + 0.5) * width) / count, y }));
  return {
    w: width + 0.2,
    h: 2 * (offset + SEAT / 2),
    body: { w: width, h: 1.0 },
    seats: [...row(top, -offset), ...row(bottom, offset)],
  };
}

const pctX = (v: number) => `${(v / W) * 100}%`;
const pctY = (v: number) => `${(v / H) * 100}%`;
const labelFont = "max(9px, 1.3cqw)";

function FixtureBox({ fixture }: { fixture: Fixture }) {
  const common = {
    position: "absolute" as const,
    left: pctX(fixture.x),
    top: pctY(fixture.y),
    width: pctX(fixture.w),
    height: pctY(fixture.h),
    pointerEvents: "none" as const,
  };
  if (fixture.kind === "door") {
    return (
      <Box sx={{ ...common, bgcolor: "secondary.main", borderRadius: 0.5 }}>
        <Typography
          component="span"
          sx={{
            position: "absolute",
            left: "130%",
            top: 0,
            height: "100%",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: labelFont,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {fixture.label}
        </Typography>
      </Box>
    );
  }
  const styles: Record<Exclude<Fixture["kind"], "door">, Record<string, string>> = {
    stage: { bgcolor: "#2b3440", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" },
    dancefloor: {
      backgroundImage: `repeating-conic-gradient(${tint("primary-main", 20)} 0 25%, ${tint("primary-main", 7)} 0 50%)`,
      backgroundSize: `${(2 / fixture.w) * 100}% ${(2 / fixture.h) * 100}%`,
      color: "text.primary",
      border: "1px solid var(--mui-palette-divider)",
    },
    bar: { bgcolor: tint("secondary-main", 28), color: "text.primary", border: "1px solid var(--mui-palette-divider)" },
  };
  return (
    <Box
      sx={{
        ...common,
        ...styles[fixture.kind as Exclude<Fixture["kind"], "door">],
        borderRadius: 1,
        display: "grid",
        placeItems: "center",
        fontSize: labelFont,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {fixture.label}
    </Box>
  );
}

function TableGroup({ table }: { table: Table }) {
  const plan = usePlan();
  const [over, setOver] = React.useState(false);
  const geo = React.useMemo(() => geometry(table), [table]);
  const occ = plan.occupants(table.id);
  const count = occ.filter(Boolean).length;
  const flags = plan.tableFlags[table.id] ?? [];
  const selected = plan.selectedTableId === table.id;
  const round = table.shape === "round";
  const dragging = plan.dragId !== null;

  const onSeat = (index: number, guest: Guest | null) => {
    if (plan.heldId) {
      if (guest && guest.id === plan.heldId) {
        plan.pick(guest.id);
        return;
      }
      plan.place(plan.heldId, table.id, index);
      return;
    }
    plan.selectTable(table.id);
    if (guest) plan.pick(guest.id);
  };

  const onBody = () => {
    if (plan.heldId) {
      plan.place(plan.heldId, table.id);
      return;
    }
    plan.selectTable(table.id);
  };

  return (
    <Box
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
        if (!plan.dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
        setOver(false);
        plan.setDragId(null);
        if (id) plan.place(id, table.id);
      }}
      sx={{
        position: "absolute",
        left: pctX(table.x - geo.w / 2),
        top: pctY(table.y - geo.h / 2),
        width: pctX(geo.w),
        height: pctY(geo.h),
        borderRadius: round ? "50%" : 4,
        bgcolor: over ? tint("primary-main", 18) : selected ? tint("primary-main", 8) : "transparent",
        outline: over
          ? "2px dashed var(--mui-palette-primary-main)"
          : dragging
            ? "1px dashed var(--mui-palette-divider)"
            : "none",
      }}
    >
      <ButtonBase
        onClick={onBody}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats filled${
          flags.length ? `, ${flags.length} rule${flags.length > 1 ? "s" : ""} broken` : ""
        }`}
        sx={{
          position: "absolute",
          left: `${((1 - geo.body.w / geo.w) / 2) * 100}%`,
          top: `${((1 - geo.body.h / geo.h) / 2) * 100}%`,
          width: `${(geo.body.w / geo.w) * 100}%`,
          height: `${(geo.body.h / geo.h) * 100}%`,
          borderRadius: round ? "50%" : 2,
          bgcolor: "background.paper",
          border: selected ? "3px solid" : "2px solid",
          borderColor: flags.length ? "error.main" : selected ? "primary.main" : "text.disabled",
          flexDirection: "column",
          lineHeight: 1.15,
          textAlign: "center",
          "&:hover": { bgcolor: tint("primary-main", 10) },
        }}
      >
        <Box component="span" sx={{ fontSize: "max(9px, 1.25cqw)", fontWeight: 800 }}>
          {table.name}
        </Box>
        <Box component="span" sx={{ fontSize: "max(9px, 1.15cqw)", color: "text.secondary" }}>
          {count}/{table.seats}
        </Box>
        {flags.length ? (
          <WarningAmberIcon
            color="error"
            titleAccess="Rule broken"
            sx={{ position: "absolute", top: "-12%", right: round ? "2%" : "-1%", fontSize: "max(14px, 1.7cqw)", bgcolor: "background.paper", borderRadius: "50%" }}
          />
        ) : null}
      </ButtonBase>

      {geo.seats.map((pos, i) => {
        const guest = occ[i];
        const held = guest !== null && plan.heldId === guest.id;
        const flagged = guest !== null && (plan.guestFlags[guest.id] ?? []).length > 0;
        const label = guest
          ? `${guest.name}, ${table.name} seat ${i + 1}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}`
          : `${table.name} seat ${i + 1}, empty`;
        return (
          <Box
            key={i}
            draggable={guest !== null}
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
              plan.setDragId(guest.id);
            }}
            onDragEnd={() => plan.setDragId(null)}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
              setOver(false);
              plan.setDragId(null);
              if (id) plan.place(id, table.id, i);
            }}
            sx={{
              position: "absolute",
              left: `${((pos.x + geo.w / 2 - SEAT / 2) / geo.w) * 100}%`,
              top: `${((pos.y + geo.h / 2 - SEAT / 2) / geo.h) * 100}%`,
              width: `${(SEAT / geo.w) * 100}%`,
              height: `${(SEAT / geo.h) * 100}%`,
              cursor: guest ? "grab" : "pointer",
            }}
          >
            <ButtonBase
              onClick={() => onSeat(i, guest)}
              aria-label={label}
              aria-pressed={guest ? held : undefined}
              title={guest ? `${guest.name} (${guest.party})${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${i + 1}: empty`}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                fontSize: "max(9px, 1.3cqw)",
                fontWeight: 700,
                color: "#fff",
                bgcolor: guest ? partyColor(guest.party) : plan.heldId ? tint("primary-main", 10) : "background.paper",
                border: guest ? "2px solid var(--mui-palette-background-paper)" : "2px dashed",
                borderColor: guest ? undefined : plan.heldId ? "primary.main" : "text.disabled",
                boxShadow: flagged ? "0 0 0 3px var(--mui-palette-error-main)" : "none",
                outline: held ? "3px solid var(--mui-palette-primary-main)" : "none",
                outlineOffset: 2,
                "&:hover": guest ? { filter: "brightness(1.12)" } : { bgcolor: tint("primary-main", 18) },
              }}
            >
              {guest ? initials(guest.name) : null}
              {guest?.diet ? (
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: "32%",
                    height: "32%",
                    borderRadius: "50%",
                    bgcolor: "#f2b84b",
                    border: "1.5px solid #2b3440",
                  }}
                />
              ) : null}
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}

function HeldBanner() {
  const plan = usePlan();
  if (!plan.heldId) return null;
  const guest = guestById[plan.heldId];
  const seated = plan.assign[guest.id] !== null;
  return (
    <Paper
      role="status"
      variant="outlined"
      sx={{
        mb: 1.5,
        p: 1.25,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        borderColor: "primary.main",
        bgcolor: tint("primary-main", 10),
      }}
    >
      <Typography variant="body2" sx={{ flex: "1 1 220px" }}>
        <strong>{guest.name}</strong> is selected. Tap an empty seat or a table to {seated ? "move them" : "seat them"}.
      </Typography>
      {seated ? (
        <Button size="small" variant="outlined" onClick={() => plan.unseat(guest.id)} sx={{ minHeight: 40 }}>
          Unseat
        </Button>
      ) : null}
      <Button size="small" onClick={plan.clearHeld} sx={{ minHeight: 40 }}>
        Cancel
      </Button>
    </Paper>
  );
}

export default function RoomPlan() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" flexWrap="wrap" alignItems="baseline" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
          Room plan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.venue} · {W} × {H} m
        </Typography>
      </Stack>
      <HeldBanner />
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box
          role="group"
          aria-label={`Room plan of ${event.venue}, drawn to scale`}
          sx={{
            position: "relative",
            width: "100%",
            minWidth: 800,
            aspectRatio: `${W} / ${H}`,
            containerType: "inline-size",
            border: "3px solid",
            borderColor: "text.secondary",
            borderRadius: 2,
            bgcolor: "background.default",
            backgroundImage: `linear-gradient(to right, ${tint("text-primary", 6)} 1px, transparent 1px), linear-gradient(to bottom, ${tint("text-primary", 6)} 1px, transparent 1px)`,
            backgroundSize: `${100 / W}% ${100 / H}%`,
            boxSizing: "border-box",
          }}
        >
          {fixtures.map((f) => (
            <FixtureBox key={f.id} fixture={f} />
          ))}
          {tables.map((t) => (
            <TableGroup key={t.id} table={t} />
          ))}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              right: "1.5%",
              top: pctY(0.35),
              width: pctX(5),
              borderTop: "2px solid",
              borderLeft: "2px solid",
              borderRight: "2px solid",
              borderColor: "text.secondary",
              height: 6,
              color: "text.secondary",
              fontSize: labelFont,
              textAlign: "center",
              pt: 0.5,
            }}
          >
            5 m
          </Box>
        </Box>
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={{ xs: 1, sm: 2 }} sx={{ mt: 1.5 }} aria-label="Legend" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {parties.map((p) => (
          <Stack component="li" key={p} direction="row" alignItems="center" spacing={0.75}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: partyColor(p) }} />
            <Typography variant="caption" color="text.secondary">
              {p}
            </Typography>
          </Stack>
        ))}
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f2b84b", border: "1.5px solid #2b3440" }} />
          <Typography variant="caption" color="text.secondary">
            Dietary need
          </Typography>
        </Stack>
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", border: "2px dashed", borderColor: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            Empty seat
          </Typography>
        </Stack>
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", boxShadow: "0 0 0 2px var(--mui-palette-error-main)" }} />
          <Typography variant="caption" color="text.secondary">
            Rule broken
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
