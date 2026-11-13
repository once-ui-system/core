"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Heading,
  IconButton,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { event, guests, tables } from "@/lib/data";
import { guestById, initials, tableById } from "@/lib/seating";
import { RoomPlan } from "./RoomPlan";
import { useSeating } from "./SeatProvider";

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "danger" | "success";
}) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4" fillWidth>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        variant="display-strong-xs"
        onBackground={tone === "danger" ? "danger-strong" : tone === "success" ? "success-strong" : "neutral-strong"}
      >
        {value}
      </Text>
      {hint ? (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {hint}
        </Text>
      ) : null}
    </Column>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" aria-label={title} background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

export function PlanView() {
  const { assignment, seats, counts, ruleResults, place, unseat, reset } = useSeating();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [dragGuest, setDragGuest] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unseated = useMemo(
    () => guests.filter((g) => g.rsvp === "yes" && !assignment[g.id]),
    [assignment],
  );
  const unconfirmed = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
  const broken = ruleResults.filter((r) => r.status === "broken");
  const pending = ruleResults.filter((r) => r.status === "pending");

  const armedGuest = armed ? guestById.get(armed) : null;

  function doPlace(guestId: string, tableId: string, seat?: number) {
    const res = place(guestId, tableId, seat);
    setStatus(res.message);
    if (res.ok) {
      setSelectedTable(tableId);
      setArmed(null);
    }
  }

  function doUnseat(guestId: string) {
    const res = unseat(guestId);
    setStatus(res.message);
    if (res.ok) setArmed(null);
  }

  function onTableClick(tableId: string) {
    if (armed) doPlace(armed, tableId);
    else setSelectedTable((cur) => (cur === tableId ? null : tableId));
  }

  function onSeatClick(tableId: string, seat: number, occupant: string | null) {
    if (armed) {
      if (occupant === armed) {
        setArmed(null);
        setStatus("Selection cleared.");
        return;
      }
      doPlace(armed, tableId, seat);
      return;
    }
    setSelectedTable(tableId);
    if (occupant) {
      setArmed(occupant);
      setStatus(`${guestById.get(occupant)?.name} selected. Tap a seat or table to move them.`);
    }
  }

  function onDrop(tableId: string, seat: number | undefined) {
    const id = dragGuest;
    setDropKey(null);
    setDragGuest(null);
    if (id) doPlace(id, tableId, seat);
  }

  function toggleArm(id: string) {
    setArmed((cur) => {
      const next = cur === id ? null : id;
      setStatus(next ? `${guestById.get(id)?.name} selected. Tap a seat or table to place them.` : "Selection cleared.");
      return next;
    });
  }

  const sel = selectedTable ? tableById.get(selectedTable) : null;
  const selSeats = selectedTable ? seats[selectedTable] : [];

  return (
    <Column fillWidth maxWidth={100} gap="20" className="sw-layout-wrap">
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            Seating plan
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {event.venue} · {event.room_m.width} × {event.room_m.depth} m room, drawn to scale
          </Text>
        </Column>
        <Button size="s" variant="tertiary" prefixIcon="refresh" onClick={() => { reset(); setArmed(null); setStatus("Plan reset to the saved seating."); }}>
          Reset plan
        </Button>
      </Row>

      <div className="sw-stats">
        <Stat label="Attending" value={String(counts.attending)} hint={`${unconfirmed} not confirmed yet`} />
        <Stat label="Seated" value={`${counts.seated}`} hint={`${counts.capacity} seats in the room`} tone="success" />
        <Stat
          label="Unseated"
          value={String(counts.unseated)}
          hint={counts.unseated === 0 ? "Everyone has a seat" : "Attending, still to place"}
        />
        <Stat
          label="Rules broken"
          value={String(broken.length)}
          hint={`${ruleResults.length} rules, ${pending.length} waiting on a seat`}
          tone={broken.length ? "danger" : "success"}
        />
      </div>

      <div role="status" aria-live="polite" className="sw-status">
        <Row
          fillWidth
          paddingX="16"
          paddingY="8"
          radius="m"
          gap="12"
          vertical="center"
          horizontal="between"
          background={armedGuest ? "accent-alpha-weak" : "neutral-alpha-weak"}
          wrap
        >
          <Text variant="body-default-s">
            {armedGuest
              ? `Placing ${armedGuest.name}: tap an empty seat to sit them there, or a table for the first free seat. Esc cancels.`
              : status || "Drag a guest onto a seat, or tap a guest, then tap where they should sit."}
          </Text>
          {armedGuest ? (
            <Row gap="8">
              {assignment[armedGuest.id] ? (
                <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => doUnseat(armedGuest.id)}>
                  Unseat
                </Button>
              ) : null}
              <Button size="s" variant="tertiary" onClick={() => setArmed(null)}>
                Cancel
              </Button>
            </Row>
          ) : null}
        </Row>
      </div>

      <div className="sw-layout">
        <Column gap="12" fillWidth minWidth={0}>
          <RoomPlan
            selectedTable={selectedTable}
            armedGuest={armed}
            dragGuest={dragGuest}
            dropKey={dropKey}
            onTableClick={onTableClick}
            onSeatClick={onSeatClick}
            onDropTarget={setDropKey}
            onDrop={onDrop}
            onDragStart={(id) => {
              setDragGuest(id);
              setArmed(null);
            }}
            onDragEnd={() => {
              setDragGuest(null);
              setDropKey(null);
            }}
          />
          <Row gap="16" wrap vertical="center">
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Scroll sideways on a small screen. Orange dot: dietary need. Red: a rule is broken.
            </Text>
          </Row>
        </Column>

        <div className="sw-aside">
          <Panel
            title="Unseated guests"
            aside={<Tag size="s" scheme={unseated.length ? "accent" : "success"} label={String(unseated.length)} />}
          >
            <div
              className={`sw-guest-list${dragGuest && assignment[dragGuest] ? " sw-guest-list--drop" : ""}`}
              onDragOver={(e) => {
                if (dragGuest && assignment[dragGuest]) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = dragGuest;
                setDragGuest(null);
                setDropKey(null);
                if (id) doUnseat(id);
              }}
            >
              {unseated.length === 0 ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Everyone attending has a seat. Drag a seated guest here to unseat them.
                </Text>
              ) : (
                unseated.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    draggable
                    aria-pressed={armed === g.id}
                    className={`sw-guest${armed === g.id ? " sw-guest--armed" : ""}`}
                    onClick={() => toggleArm(g.id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragGuest(g.id);
                      setArmed(null);
                    }}
                    onDragEnd={() => {
                      setDragGuest(null);
                      setDropKey(null);
                    }}
                  >
                    <Avatar size="s" value={initials(g.name)} />
                    <Column gap="2" flex={1} minWidth={0}>
                      <Text variant="label-strong-s" truncate>
                        {g.name}
                      </Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                        {g.party}
                      </Text>
                    </Column>
                    {g.diet ? <Tag size="s" scheme="accent" label={g.diet} /> : null}
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel
            title="Rules"
            aside={
              <Tag
                size="s"
                scheme={broken.length ? "danger" : "success"}
                label={broken.length ? `${broken.length} broken` : "All clear"}
              />
            }
          >
            <Column gap="8">
              {ruleResults.map((r) => (
                <Row
                  key={r.index}
                  gap="12"
                  padding="12"
                  radius="m"
                  border
                  background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
                  vertical="start"
                >
                  <Column gap="4" flex={1} minWidth={0}>
                    <Row gap="8" vertical="center" wrap>
                      <Tag
                        size="s"
                        scheme={r.status === "broken" ? "danger" : r.status === "ok" ? "success" : "neutral"}
                        label={r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Open"}
                      />
                      <Text variant="label-strong-s">{r.title}</Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {r.detail}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {r.rule.note}
                    </Text>
                  </Column>
                  {r.tables.length && r.status === "broken" ? (
                    <Button size="s" variant="tertiary" onClick={() => setSelectedTable(r.tables[0])}>
                      Show
                    </Button>
                  ) : null}
                </Row>
              ))}
            </Column>
          </Panel>

          <Panel
            title={sel ? sel.name : "Tables"}
            aside={
              sel ? (
                <IconButton
                  icon="close"
                  variant="tertiary"
                  size="s"
                  ariaLabel="Close table details"
                  onClick={() => setSelectedTable(null)}
                />
              ) : undefined
            }
          >
            {sel ? (
              <Column gap="8">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {counts.perTable[sel.id]} of {sel.seats} seats taken
                  {sel.seats - counts.perTable[sel.id] > 0 ? `, ${sel.seats - counts.perTable[sel.id]} free` : ", full"}
                </Text>
                <Column as="ol" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {selSeats.map((gid, i) => {
                    const g = gid ? guestById.get(gid) : null;
                    return (
                      <Row
                        as="li"
                        key={`${sel.id}-${i}`}
                        gap="8"
                        vertical="center"
                        paddingY="4"
                        borderBottom
                      >
                        <Text variant="label-default-xs" onBackground="neutral-weak" style={{ width: 20 }}>
                          {i + 1}
                        </Text>
                        {g ? (
                          <>
                            <Column gap="2" flex={1} minWidth={0}>
                              <Text variant="label-strong-s" truncate>
                                {g.name}
                              </Text>
                              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                                {g.party}
                              </Text>
                            </Column>
                            <Tag
                              size="s"
                              scheme={g.diet ? "accent" : "neutral"}
                              label={g.diet ?? "No dietary need"}
                            />
                            <IconButton
                              icon="personRemove"
                              variant="tertiary"
                              size="s"
                              ariaLabel={`Unseat ${g.name}`}
                              tooltip="Unseat"
                              onClick={() => doUnseat(g.id)}
                            />
                          </>
                        ) : armedGuest ? (
                          <Button
                            size="s"
                            variant="secondary"
                            fillWidth
                            onClick={() => doPlace(armedGuest.id, sel.id, i)}
                          >
                            Seat {armedGuest.name.split(" ")[0]} here
                          </Button>
                        ) : (
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            Empty seat
                          </Text>
                        )}
                      </Row>
                    );
                  })}
                </Column>
                <DietSummary tableId={sel.id} />
              </Column>
            ) : (
              <Column gap="8">
                {tables.map((t) => {
                  const n = counts.perTable[t.id];
                  const bad = ruleResults.some((r) => r.status === "broken" && r.tables.includes(t.id));
                  return (
                    <button key={t.id} type="button" className="sw-row-btn" onClick={() => onTableClick(t.id)}>
                      <Column gap="4" flex={1} minWidth={0}>
                        <Text variant="label-strong-s">{t.name}</Text>
                        <div className="sw-bar" aria-hidden="true">
                          <span style={{ width: `${(n / t.seats) * 100}%` }} />
                        </div>
                      </Column>
                      {bad ? <Tag size="s" scheme="danger" label="Rule" /> : null}
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {n}/{t.seats}
                      </Text>
                    </button>
                  );
                })}
              </Column>
            )}
          </Panel>
        </div>
      </div>
    </Column>
  );
}

function DietSummary({ tableId }: { tableId: string }) {
  const { seats } = useSeating();
  const diets = new Map<string, number>();
  for (const gid of seats[tableId]) {
    const g = gid ? guestById.get(gid) : null;
    if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  }
  return (
    <Column gap="4" paddingTop="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        Dietary needs at this table
      </Text>
      {diets.size === 0 ? (
        <Text variant="body-default-s">None: standard menu for everyone.</Text>
      ) : (
        <Row gap="8" wrap>
          {Array.from(diets).map(([d, n]) => (
            <Tag key={d} size="m" scheme="accent" label={`${n} × ${d}`} />
          ))}
        </Row>
      )}
    </Column>
  );
}
