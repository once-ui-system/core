"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { Button, Column, Heading, Icon, Input, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, GUESTS, STANDARD_MEAL, TABLE_BY_ID, TABLES, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import { C, resetButton } from "./ui";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      {children}
    </Column>
  );
}

function statusColor(status: RuleResult["status"]): string {
  if (status === "broken") return C.danger;
  if (status === "pending") return C.warning;
  return C.success;
}

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const pending = results.filter((r) => r.status === "pending").length;
  return (
    <Panel>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          Couple&apos;s rules
        </Heading>
        {broken > 0 ? (
          <Tag tone="danger" size="s" prefixIcon="danger" label={`${broken} broken`} />
        ) : (
          <Tag tone="success" size="s" prefixIcon="check" label="None broken" />
        )}
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {broken} broken, {pending} waiting for a seat, {results.length - broken - pending} kept.
      </Text>
      <Column as="ul" gap="8" margin="0" padding="0">
        {results.map((r) => (
          <li key={r.index} style={{ listStyle: "none" }}>
            <button
              type="button"
              disabled={r.tables.length === 0}
              onClick={() => r.tables[0] && selectTable(r.tables[0])}
              style={{
                ...resetButton,
                display: "flex",
                gap: 10,
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: `1px solid ${r.status === "broken" ? C.danger : C.lineWeak}`,
                background: r.status === "broken" ? C.dangerTint : "transparent",
                cursor: r.tables.length ? "pointer" : "default",
              }}
            >
              <span style={{ color: statusColor(r.status), flexShrink: 0, marginTop: 1 }}>
                <Icon
                  name={r.status === "ok" ? "check" : r.status === "broken" ? "danger" : "time"}
                  size="s"
                  tooltip={undefined}
                />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.title}</span>
                <span style={{ fontSize: 12, color: statusColor(r.status), fontWeight: 600 }}>
                  {r.status === "broken" ? "Broken: " : r.status === "pending" ? "Waiting: " : "Kept: "}
                  <span style={{ fontWeight: 400, color: C.text }}>{r.message}</span>
                </span>
                <span style={{ fontSize: 12, color: C.textWeak }}>{r.note}</span>
              </span>
            </button>
          </li>
        ))}
      </Column>
    </Panel>
  );
}

export function TablePanel() {
  const { selectedTable, seating, arm, armed, unseat, results, stats } = usePlan();
  if (!selectedTable) {
    return (
      <Panel>
        <Heading as="h2" textVariant="heading-strong-s">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Panel>
    );
  }
  const table = TABLE_BY_ID[selectedTable];
  const info = stats.perTable[table.id];
  const seats = seating[table.id];
  const guests = seats.filter((id): id is string => id !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const guest of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const standard = guests.filter((x) => !x.diet).length;
  const ruleHits = results.filter((r) => r.tables.includes(table.id) && r.status === "broken");

  return (
    <Panel>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          {table.name}
        </Heading>
        <Tag
          size="s"
          tone={info.filled === info.cap ? "success" : "neutral"}
          label={`${info.filled} of ${info.cap} seats${info.filled === info.cap ? " (full)" : ""}`}
        />
      </Row>

      {ruleHits.map((r) => (
        <Row key={r.index} gap="8" vertical="start" padding="8" radius="m" style={{ background: C.dangerTint }}>
          <Icon name="danger" size="s" onBackground="danger-strong" />
          <Text textVariant="body-default-s">
            {r.title}. {r.message}
          </Text>
        </Row>
      ))}

      <Column gap="4">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Dietary needs at this table
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-s">None. {standard} on the standard menu.</Text>
        ) : (
          <Row gap="4" wrap>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Tag key={diet} tone="accent" size="s" label={`${n} × ${diet}`} />
            ))}
            <Tag size="s" label={`${standard} × ${STANDARD_MEAL.toLowerCase()}`} />
          </Row>
        )}
      </Column>

      <Column as="ol" gap="4" margin="0" padding="0">
        {seats.map((id, i) => {
          const guest = id ? GUEST_BY_ID[id] : null;
          return (
            <li
              key={i}
              style={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                borderTop: i === 0 ? "none" : `1px solid ${C.lineWeak}`,
              }}
            >
              <span style={{ width: 18, fontSize: 12, color: C.textWeak }}>{i + 1}</span>
              {guest ? (
                <>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text }}>
                      {guest.name}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: C.textWeak }}>
                      {guest.party}
                      {guest.diet ? ` · ${guest.diet}` : ""}
                    </span>
                  </span>
                  <Button
                    size="s"
                    variant={armed === guest.id ? "primary" : "secondary"}
                    onClick={() => arm(armed === guest.id ? null : guest.id)}
                    aria-label={`Pick up ${guest.name} to move`}
                  >
                    {armed === guest.id ? "Picked up" : "Move"}
                  </Button>
                  <Button
                    size="s"
                    variant="tertiary"
                    prefixIcon="personRemove"
                    onClick={() => unseat(guest.id)}
                    aria-label={`Unseat ${guest.name}`}
                  >
                    Unseat
                  </Button>
                </>
              ) : (
                <span style={{ flex: 1, fontSize: 13, color: C.textWeak, fontStyle: "italic" }}>
                  Empty seat
                </span>
              )}
            </li>
          );
        })}
      </Column>
    </Panel>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  const { armed, arm } = usePlan();
  const isArmed = armed === guest.id;
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => arm(isArmed ? null : guest.id)}
      aria-pressed={isArmed}
      style={{
        ...resetButton,
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: `${isArmed ? 2 : 1}px solid ${isArmed ? C.brand : C.lineWeak}`,
        background: isArmed ? C.brandTint : "transparent",
        boxSizing: "border-box",
      }}
    >
      <span style={{ color: C.textWeak, display: "inline-flex" }} aria-hidden="true">
        <Icon name="grip" size="xs" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text }}>
          {guest.name}
        </span>
        <span style={{ display: "block", fontSize: 12, color: C.textWeak }}>
          {guest.party}
          {guest.rsvp === "maybe" ? " · maybe" : guest.rsvp === "pending" ? " · no reply yet" : ""}
        </span>
      </span>
      {guest.diet ? <Tag tone="accent" size="s" label={guest.diet} /> : null}
    </button>
  );
}

export function UnseatedPanel() {
  const { tableOf, unseat, stats } = usePlan();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (x: Guest) =>
    !query || x.name.toLowerCase().includes(query) || x.party.toLowerCase().includes(query);
  const attending = GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id] && match(x));
  const awaiting = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id] && match(x),
  );
  const [dropping, setDropping] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    const id = e.dataTransfer.getData("text/plain");
    if (GUEST_BY_ID[id] && tableOf[id]) unseat(id);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={onDrop}
      style={{ borderRadius: 16, outline: dropping ? `2px solid ${C.brand}` : "none" }}
    >
      <Panel>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Heading as="h2" textVariant="heading-strong-s">
            To seat
          </Heading>
          <Tag
            size="s"
            tone={stats.unseatedAttending === 0 ? "success" : "warning"}
            label={`${stats.unseatedAttending} attending unseated`}
          />
        </Row>
        <Input
          id="unseated-filter"
          label="Find a guest"
          size="s"
          value={q}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Tap a guest, then a table or seat. Drag a seated guest here to unseat them.
        </Text>
        {attending.length === 0 ? (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {query ? "No unseated guest matches." : "Everyone attending has a seat."}
          </Text>
        ) : (
          <Column as="ul" gap="6" margin="0" padding="0">
            {attending.map((x) => (
              <li key={x.id} style={{ listStyle: "none" }}>
                <GuestRow guest={x} />
              </li>
            ))}
          </Column>
        )}
        {awaiting.length > 0 ? (
          <Column gap="6">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Not confirmed yet ({awaiting.length})
            </Text>
            <Column as="ul" gap="6" margin="0" padding="0">
              {awaiting.map((x) => (
                <li key={x.id} style={{ listStyle: "none" }}>
                  <GuestRow guest={x} />
                </li>
              ))}
            </Column>
          </Column>
        ) : null}
      </Panel>
    </div>
  );
}

export { TABLES };
