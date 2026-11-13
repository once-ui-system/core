"use client";

import { Badge, Group, Text, Tooltip } from "@mantine/core";
import { useEffect, useState, type CSSProperties, type DragEvent } from "react";
import { FIXTURES, GUEST_BY_ID, ROOM, TABLES, partyColor, shortName, type Fixture, type TableDef } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

const SEAT_W = 1.0;
const SEAT_H = 0.68;

interface Geometry {
  gw: number;
  gh: number;
  discW: number;
  discH: number;
  seats: { x: number; y: number }[];
}

function geometry(t: TableDef): Geometry {
  if (t.shape === "long") {
    const perSide = Math.ceil(t.seats / 2);
    const gap = 1.15;
    const seats: { x: number; y: number }[] = [];
    for (let i = 0; i < t.seats; i++) {
      const top = i < perSide;
      const col = top ? i : i - perSide;
      const n = top ? perSide : t.seats - perSide;
      seats.push({ x: (col - (n - 1) / 2) * gap, y: top ? -0.95 : 0.95 });
    }
    return { gw: perSide * gap + 0.9, gh: 2.8, discW: (perSide - 1) * gap + SEAT_W + 0.2, discH: 0.9, seats };
  }
  const ring = t.seats <= 6 ? 1.45 : 1.65;
  const radius = t.seats <= 6 ? 0.85 : 1.0;
  const size = 2 * (ring + SEAT_W / 2) + 0.1;
  const seats = Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { x: ring * Math.cos(a), y: ring * Math.sin(a) };
  });
  return { gw: size, gh: size, discW: radius * 2, discH: radius * 2, seats };
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

const fixtureClass: Record<Fixture["kind"], string> = {
  stage: css.stage,
  dancefloor: css.dance,
  bar: css.bar,
  door: css.door,
};

function seatVars(party: string): CSSProperties {
  const c = partyColor(party);
  const shade = c === "gray" ? 2 : 1;
  return {
    "--seat-bg": `var(--mantine-color-${c}-${shade})`,
    "--seat-bd": `var(--mantine-color-${c}-5)`,
    "--seat-fg": `var(--mantine-color-${c}-9)`,
  } as CSSProperties;
}

export function RoomPlan() {
  const { seats, selectedTable, selectTable, held, hold, dragging, setDragging, seatGuest, tableFlags, flaggedGuests } =
    usePlan();
  const [over, setOver] = useState<string | null>(null);
  const placing = held ?? dragging;

  useEffect(() => {
    if (!dragging) setOver(null);
  }, [dragging]);

  const drop = (e: DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    setOver(null);
    setDragging(null);
    if (id && GUEST_BY_ID[id]) {
      seatGuest(id, tableId, seat);
      selectTable(tableId);
    }
  };

  const onSeatClick = (t: TableDef, i: number) => {
    const occupant = seats[t.id][i];
    selectTable(t.id);
    if (held) {
      if (occupant === held) hold(null);
      else seatGuest(held, t.id, i);
      return;
    }
    if (occupant) hold(occupant);
  };

  const onTableClick = (t: TableDef) => {
    selectTable(t.id);
    if (held) seatGuest(held, t.id);
  };

  return (
    <div>
      <div
        className={css.roomScroll}
        role="region"
        aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale. Scrolls sideways on narrow screens.`}
        tabIndex={0}
      >
        <div className={css.room}>
          {FIXTURES.map((f) => (
            <div
              key={f.id}
              className={`${css.fixture} ${fixtureClass[f.kind]}`}
              role="img"
              aria-label={f.label}
              style={{
                left: pct(f.x, ROOM.width),
                top: pct(f.y, ROOM.depth),
                width: pct(f.w, ROOM.width),
                height: pct(f.h, ROOM.depth),
              }}
            >
              {f.label}
            </div>
          ))}

          {TABLES.map((t) => {
            const g = geometry(t);
            const row = seats[t.id];
            const taken = row.filter(Boolean).length;
            const flags = tableFlags[t.id] ?? [];
            const isOver = over !== null && over.split(":")[0] === t.id;
            const selected = selectedTable === t.id;
            return (
              <div
                key={t.id}
                className={`${css.group} ${t.shape === "long" ? css.groupLong : ""} ${isOver ? css.groupOver : ""}`}
                style={{
                  left: pct(t.x, ROOM.width),
                  top: pct(t.y, ROOM.depth),
                  width: pct(g.gw, ROOM.width),
                  aspectRatio: `${g.gw} / ${g.gh}`,
                  transform: `translate(-50%, -50%)${t.rotation ? ` rotate(${t.rotation}deg)` : ""}`,
                }}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOver(t.id);
                }}
                onDrop={(e) => drop(e, t.id)}
              >
                <button
                  type="button"
                  className={`${css.disc} ${t.shape === "long" ? css.discLong : ""} ${selected ? css.discSelected : ""} ${flags.length ? css.discFlag : ""}`}
                  style={{ width: pct(g.discW, g.gw), height: pct(g.discH, g.gh) }}
                  onClick={() => onTableClick(t)}
                  aria-pressed={selected}
                  aria-label={`${t.name}, ${taken} of ${t.seats} seats taken${flags.length ? `, ${flags.length} broken ${flags.length === 1 ? "rule" : "rules"}` : ""}`}
                >
                  <span className={css.tName}>{t.name}</span>
                  <span className={css.tCount}>
                    {taken}/{t.seats}
                  </span>
                  {flags.length > 0 && (
                    <span className={css.flagBadge} aria-hidden="true">
                      !
                    </span>
                  )}
                </button>

                {g.seats.map((p, i) => {
                  const gid = row[i];
                  const guest = gid ? GUEST_BY_ID[gid] : null;
                  const key = `${t.id}:${i}`;
                  const flagged = gid ? flaggedGuests.has(gid) : false;
                  const classes = [
                    css.seat,
                    guest ? "" : css.seatEmpty,
                    !guest && placing ? css.seatTarget : "",
                    over === key ? css.seatOver : "",
                    gid && held === gid ? css.seatHeld : "",
                    flagged ? css.seatFlag : "",
                  ].join(" ");
                  const style: CSSProperties = {
                    left: pct(g.gw / 2 + p.x, g.gw),
                    top: pct(g.gh / 2 + p.y, g.gh),
                    width: pct(SEAT_W, g.gw),
                    height: pct(SEAT_H, g.gh),
                    ...(guest ? seatVars(guest.party) : {}),
                  };
                  const button = (
                    <button
                      type="button"
                      className={classes}
                      style={style}
                      draggable={Boolean(guest)}
                      onClick={() => onSeatClick(t, i)}
                      onDragStart={(e) => {
                        if (!gid) return;
                        e.dataTransfer.setData("text/plain", gid);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(gid);
                      }}
                      onDragEnd={() => setDragging(null)}
                      onDragOver={(e) => {
                        if (!dragging) return;
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                        setOver(key);
                      }}
                      onDrop={(e) => drop(e, t.id, i)}
                      aria-label={
                        guest
                          ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}`
                          : `${t.name}, seat ${i + 1}, empty${held ? `. Place ${GUEST_BY_ID[held].name} here` : ""}`
                      }
                    >
                      {guest ? (
                        <>
                          <span className={css.seatName}>{shortName(guest.name)}</span>
                          {guest.diet && <span className={css.dietDot} aria-hidden="true" />}
                        </>
                      ) : (
                        <span aria-hidden="true">{i + 1}</span>
                      )}
                    </button>
                  );
                  return guest ? (
                    <Tooltip
                      key={key}
                      label={`${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`}
                      openDelay={250}
                      withArrow
                    >
                      {button}
                    </Tooltip>
                  ) : (
                    <span key={key}>{button}</span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <Group gap="md" mt="sm" align="center">
        <Text size="xs" c="dimmed">
          Room {ROOM.width} m by {ROOM.depth} m, to scale (grid squares are 1 m).
        </Text>
        <Group gap={6}>
          {["Couple", "Bride's family", "Groom's family", "University friends", "Work friends", "Groom's football club", "Plus-ones"].map((p) => (
            <Badge key={p} size="sm" variant="light" color={partyColor(p)} radius="sm" tt="none" fw={600}>
              {p}
            </Badge>
          ))}
        </Group>
        <Group gap={6}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f08c00", display: "inline-block" }} aria-hidden="true" />
          <Text size="xs" c="dimmed">
            Dietary need
          </Text>
          <span style={{ width: 14, height: 10, borderRadius: 6, boxShadow: "0 0 0 2px #e03131", display: "inline-block", marginLeft: 8 }} aria-hidden="true" />
          <Text size="xs" c="dimmed">
            Breaks a rule
          </Text>
        </Group>
      </Group>
    </div>
  );
}
