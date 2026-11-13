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
