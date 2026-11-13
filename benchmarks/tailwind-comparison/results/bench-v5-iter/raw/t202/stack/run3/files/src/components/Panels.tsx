"use client";

import { Column, Grid, Heading, IconButton, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { guests as allGuests, tables, type Guest } from "@/lib/data";
import { guestById, initials, tableById, usePlan } from "@/lib/plan";

function Panel({
  title,
  aside,
  children,
  id,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" id={id} variant="heading-strong-m">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

export function StatsRow() {
  const { seatedCount, toSeat, results, attendingCount } = usePlan();
  const capacity = tables.reduce((n, t) => n + t.seats, 0);
  const broken = results.filter((r) => r.status === "broken").length;
  const stats = [
    { label: "Seated", value: String(seatedCount), note: `of ${attendingCount} attending` },
    { label: "Still to seat", value: String(toSeat.length), note: toSeat.length === 0 ? "everyone attending has a seat" : "attending, no seat yet" },
    { label: "Free seats", value: String(capacity - seatedCount), note: `of ${capacity} at ${tables.length} tables` },
    { label: "Rules broken", value: String(broken), note: broken === 0 ? "all clear" : `of ${results.length} rules`, bad: broken > 0 },
  ];
  return (
    <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
      {stats.map((s) => (
        <Column key={s.label} background="surface" border radius="l" padding="16" gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {s.label}
          </Text>
          <Text variant="display-strong-xs" onBackground={s.bad ? "danger-strong" : "neutral-strong"} aria-live="polite">
            {s.value}
          </Text>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {s.note}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}

export function StatusLine() {
  const { message } = usePlan();
  return (
    <Text role="status" aria-live="polite" variant="label-default-s" onBackground="neutral-weak">
      {message}
    </Text>
  );
}

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken");
  return (
    <Panel
      id="rules-h"
      title="Couple's rules"
      aside={
        <Tag scheme={broken.length ? "danger" : "success"} size="m" label={broken.length ? `${broken.length} broken` : "All kept"} />
      }
    >
      <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {results.map((r, i) => {
          const names = r.rule.guests.map((id) => guestById.get(id)?.name ?? id).join(" + ");
          const kind = r.rule.kind === "together" ? "Keep together" : r.rule.kind === "apart" ? "Keep apart" : "Seat near";
          const tone = r.status === "broken" ? "danger" : r.status === "ok" ? "success" : "neutral";
          return (
            <Column
              as="li"
              key={i}
              gap="4"
              padding="12"
              radius="m"
              border={r.status === "broken" ? "danger-alpha-strong" : true}
              background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
            >
              <Row gap="8" vertical="center" wrap>
                <Icon
                  name={r.status === "broken" ? "warning" : r.status === "ok" ? "check" : "time"}
                  size="s"
                  onBackground={`${tone}-strong` as const}
                />
                <Text variant="label-strong-s">{kind}</Text>
                <Tag
                  size="s"
                  scheme={tone}
                  label={r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "To place"}
                />
              </Row>
              <Text variant="body-default-s">{names}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {r.rule.note}
              </Text>
              <Text variant="body-default-xs" onBackground={r.status === "broken" ? "danger-strong" : "neutral-medium"}>
                {r.detail}
              </Text>
              {r.status === "broken" && r.tables.length > 0 && (
                <Row gap="8" wrap>
                  {r.tables.map((id) => (
                    <Tag
                      key={id}
                      as="button"
                      size="s"
                      scheme="danger"
                      label={`Show ${tableById.get(id)?.name}`}
                      onClick={() => selectTable(id)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Row>
              )}
            </Column>
          );
        })}
      </Column>
    </Panel>
  );
}

function dietCounts(gs: Guest[]): [string, number][] {
  const map = new Map<string, number>();
  for (const g of gs) if (g.diet) map.set(g.diet, (map.get(g.diet) ?? 0) + 1);
  return [...map.entries()];
}

export function TablePanel() {
  const { selectedTable, guestsAt, unseat, pick, picked, results } = usePlan();
  const t = selectedTable ? tableById.get(selectedTable) : null;
  if (!t) {
    return (
      <Panel id="table-h" title="Selected table">
        <Text variant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see its guests and their dietary needs.
        </Text>
      </Panel>
    );
  }
  const here = guestsAt(t.id);
  const diets = dietCounts(here);
  const flags = results.filter((r) => r.status === "broken" && r.tables.includes(t.id));
  return (
    <Panel
      id="table-h"
      title={t.name}
      aside={<Tag size="m" scheme={here.length >= t.seats ? "success" : "neutral"} label={`${here.length} of ${t.seats} seats`} />}
    >
      {flags.map((r, i) => (
        <Row key={i} gap="8" vertical="start" padding="8" radius="m" background="danger-alpha-weak">
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Text variant="body-default-xs" onBackground="danger-strong">
            {r.detail}
          </Text>
        </Row>
      ))}
      {here.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          Nobody is seated here yet.
        </Text>
      ) : (
        <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
          {here.map((g) => (
            <Row
              as="li"
              key={g.id}
              gap="8"
              vertical="center"
              paddingY="4"
              paddingX="8"
              radius="m"
              background={picked === g.id ? "brand-alpha-weak" : "transparent"}
            >
              <Column flex={1} gap="2" minWidth={0}>
                <Text variant="label-strong-s">{g.name}</Text>
                <Row gap="8" wrap vertical="center">
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {g.party}
                  </Text>
                  {g.diet && <Tag size="s" scheme="accent" label={g.diet} />}
                </Row>
              </Column>
              <IconButton
                icon="arrowRight"
                variant="tertiary"
                size="s"
                tooltip="Move"
                ariaLabel={`Pick up ${g.name} to move them`}
                onClick={() => pick(g.id)}
              />
              <IconButton
                icon="personRemove"
                variant="tertiary"
                size="s"
                tooltip="Unseat"
                ariaLabel={`Unseat ${g.name}`}
                onClick={() => unseat(g.id)}
              />
            </Row>
          ))}
        </Column>
      )}
      <Column gap="4" paddingTop="8" borderTop>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Dietary needs at this table
        </Text>
        {diets.length === 0 ? (
          <Text variant="body-default-s">None noted</Text>
        ) : (
          <Row gap="8" wrap>
            {diets.map(([d, n]) => (
              <Tag key={d} size="m" scheme="accent" label={`${n} ${d}`} />
            ))}
          </Row>
        )}
      </Column>
    </Panel>
  );
}

function GuestChip({ g }: { g: Guest }) {
  const { picked, pick } = usePlan();
  const active = picked === g.id;
  return (
    <button
      type="button"
      draggable
      aria-pressed={active}
      onClick={() => pick(active ? null : g.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", g.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        cursor: "grab",
        font: "inherit",
        padding: "8px 10px",
        minHeight: 48,
        borderRadius: 10,
        color: "var(--neutral-on-background-strong)",
        background: active ? "var(--brand-alpha-weak)" : "var(--surface-background)",
        border: active ? "2px solid var(--brand-solid-strong)" : "1px solid var(--neutral-alpha-medium)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          flex: "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          background: "var(--neutral-background-strong)",
        }}
      >
        {initials(g.name)}
      </span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</span>
        <span style={{ fontSize: 12, color: "var(--neutral-on-background-weak)" }}>
          {g.party}
          {g.diet ? ` · ${g.diet}` : ""}
        </span>
      </span>
    </button>
  );
}

export function ToSeatPanel() {
  const { toSeat, undecided, unseat, picked, seatOf } = usePlan();
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id && seatOf[id]) unseat(id);
      }}
      style={{ borderRadius: 16, outline: over ? "2px dashed var(--brand-solid-strong)" : "none", outlineOffset: 2 }}
    >
      <Panel
        id="toseat-h"
        title="Attending, no seat"
        aside={<Tag size="m" scheme={toSeat.length ? "accent" : "success"} label={String(toSeat.length)} />}
      >
        {toSeat.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Everyone who is attending has a seat.
          </Text>
        ) : (
          <Grid as="ul" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {toSeat.map((g) => (
              <li key={g.id}>
                <GuestChip g={g} />
              </li>
            ))}
          </Grid>
        )}
        {undecided.length > 0 && (
          <Column gap="8" paddingTop="8" borderTop>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Not confirmed yet (maybe or no reply)
            </Text>
            <Grid as="ul" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
              {undecided.map((g) => (
                <li key={g.id}>
                  <GuestChip g={g} />
                </li>
              ))}
            </Grid>
          </Column>
        )}
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {picked ? "Now tap a seat or a table on the plan." : "Drop a seated guest here to unseat them."}
        </Text>
      </Panel>
    </div>
  );
}

export function TablesList() {
  const { guestsAt, selectedTable, selectTable, picked, place } = usePlan();
  return (
    <Panel id="tables-h" title="Seats per table">
      <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
        {tables.map((t) => {
          const n = guestsAt(t.id).length;
          const pct = Math.round((n / t.seats) * 100);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => (picked ? place(picked, t.id) : selectTable(t.id))}
                aria-pressed={selectedTable === t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr 40px",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  minHeight: 40,
                  padding: "4px 8px",
                  font: "inherit",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 8,
                  color: "var(--neutral-on-background-strong)",
                  background: selectedTable === t.id ? "var(--brand-alpha-weak)" : "transparent",
                  border: "none",
                  textAlign: "left",
                }}
              >
                <span>{t.name}</span>
                <span aria-hidden="true" style={{ height: 6, borderRadius: 3, background: "var(--neutral-alpha-weak)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${pct}%`, background: n >= t.seats ? "var(--success-solid-strong)" : "var(--brand-solid-strong)" }} />
                </span>
                <span style={{ textAlign: "right", color: "var(--neutral-on-background-weak)" }}>
                  {n}/{t.seats}
                </span>
              </button>
            </li>
          );
        })}
      </Column>
    </Panel>
  );
}

export const guestCount = allGuests.length;
