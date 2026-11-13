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
