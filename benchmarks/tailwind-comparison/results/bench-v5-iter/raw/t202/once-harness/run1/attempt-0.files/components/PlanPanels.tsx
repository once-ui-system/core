"use client";

import { Button, Column, Heading, Icon, IconButton, Row, Tag, Text, VisuallyHidden } from "@once-ui-system/core";
import { useState } from "react";
import { GUEST_DRAG_TYPE } from "@/components/RoomPlan";
import { guests, initials, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));

function Avatarish({ name, active }: { name: string; active?: boolean }) {
  return (
    <Row
      width="32"
      height="32"
      radius="full"
      center
      background={active ? "brand-alpha-strong" : "neutral-alpha-medium"}
      border={active ? "brand-strong" : "transparent"}
      borderWidth={2}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <Text textVariant="label-strong-xs">{initials(name)}</Text>
    </Row>
  );
}

export function Stats() {
  const { seatedCount, unseatedAttending, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const attending = guests.filter((g) => g.rsvp === "yes").length;
  const seatsTotal = tables.reduce((n, t) => n + t.seats, 0);
  const items: { label: string; value: string; tone?: "danger" | "success" }[] = [
    { label: "Seated", value: String(seatedCount) },
    { label: "Attending, unseated", value: String(unseatedAttending.length), tone: unseatedAttending.length ? undefined : "success" },
    { label: "Seats free", value: String(seatsTotal - seatedCount) },
    { label: "Rules broken", value: String(broken), tone: broken ? "danger" : "success" },
  ];
  return (
    <Row gap="12" wrap fillWidth>
      {items.map((s) => (
        <Column
          key={s.label}
          background="surface"
          border={s.tone === "danger" ? "danger-medium" : true}
          radius="l"
          paddingX="16"
          paddingY="12"
          gap="4"
          flex={1}
          minWidth="9rem"
        >
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {s.label}
          </Text>
          <Text
            textVariant="display-strong-xs"
            onBackground={s.tone === "danger" ? "danger-strong" : s.tone === "success" ? "success-strong" : "neutral-strong"}
          >
            {s.value}
            <Text as="span" textVariant="body-default-s" onBackground="neutral-weak">
              {s.label === "Seated" ? ` of ${guests.filter((g) => g.rsvp !== "no").length}` : s.label === "Attending, unseated" ? ` of ${attending}` : ""}
            </Text>
          </Text>
        </Column>
      ))}
    </Row>
  );
}

export function StatusLine() {
  const { message, held, hold } = usePlan();
  return (
    <Row gap="12" vertical="center" minHeight="40" paddingX="4">
      <Text role="status" aria-live="polite" textVariant="body-default-s" onBackground="neutral-medium">
        {message || "Pick a guest from the list, or drag them onto a seat."}
      </Text>
      {held ? (
        <Button size="s" variant="tertiary" onClick={() => hold(null)}>
          Cancel
        </Button>
      ) : null}
    </Row>
  );
}

function GuestRow({ id }: { id: string }) {
  const { held, hold } = usePlan();
  const g = guestById.get(id);
  if (!g) return null;
  const active = held === id;
  return (
    <Row
      as="button"
      type="button"
      draggable
      fillWidth
      gap="12"
      padding="8"
      radius="m"
      vertical="center"
      horizontal="start"
      background={active ? "brand-alpha-weak" : "transparent"}
      border={active ? "brand-strong" : "transparent"}
      cursor="interactive"
      aria-pressed={active}
      onClick={() => hold(active ? null : id)}
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData(GUEST_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{ textAlign: "left" }}
    >
      <Avatarish name={g.name} active={active} />
      <Column flex={1} gap="2">
        <Text textVariant="label-strong-s">{g.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {g.party}
        </Text>
      </Column>
      {g.diet ? (
        <Tag tone="warning" size="s" label={g.diet} />
      ) : null}
    </Row>
  );
}

export function UnseatedList() {
  const { unseatedAttending, unseatedMaybe, unseat } = usePlan();
  const [over, setOver] = useState(false);
  return (
    <Column
      background="surface"
      border={over ? "brand-strong" : true}
      borderWidth={over ? 2 : 1}
      radius="l"
      padding="16"
      gap="12"
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData(GUEST_DRAG_TYPE);
        if (guestById.has(id)) unseat(id);
      }}
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          To seat
        </Heading>
        <Tag size="s" tone={unseatedAttending.length ? "brand" : "success"} label={`${unseatedAttending.length} attending`} />
      </Row>
      {unseatedAttending.length === 0 ? (
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Everyone attending has a seat. Drop a guest here to unseat them.
        </Text>
      ) : (
        <Column gap="2" maxHeight="20rem" overflowY="auto" aria-label="Attending guests without a seat" role="list">
          {unseatedAttending.map((id) => (
            <div role="listitem" key={id}>
              <GuestRow id={id} />
            </div>
          ))}
        </Column>
      )}
      {unseatedMaybe.length ? (
        <Column gap="4">
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            WAITING ON A REPLY
          </Text>
          <Column gap="2" role="list">
            {unseatedMaybe.map((id) => (
              <div role="listitem" key={id}>
                <GuestRow id={id} />
              </div>
            ))}
          </Column>
        </Column>
      ) : null}
    </Column>
  );
}

export function RulesSummary() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag
          size="s"
          tone={broken ? "danger" : "success"}
          label={broken ? `${broken} broken` : "All kept"}
        />
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0">
        {rules.map((r) => (
          <Row
            as="li"
            key={r.id}
            gap="12"
            padding="12"
            radius="m"
            vertical="start"
            background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"}
            border={r.status === "broken" ? "danger-medium" : "transparent"}
          >
            <Icon
              name={r.status === "broken" ? "warning" : r.status === "ok" ? "check" : "time"}
              size="s"
              onBackground={r.status === "broken" ? "danger-strong" : r.status === "ok" ? "success-strong" : "neutral-weak"}
            />
            <Column flex={1} gap="4">
              <Text textVariant="label-strong-s">
                <VisuallyHidden>{r.status === "broken" ? "Broken: " : r.status === "ok" ? "Kept: " : "Waiting: "}</VisuallyHidden>
                {r.title}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-medium">
                {r.detail}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {r.note}
              </Text>
              {r.status === "broken" && r.tableIds.length ? (
                <Row gap="8" wrap>
                  {r.tableIds.map((t) => (
                    <Button key={t} size="s" variant="secondary" onClick={() => selectTable(t)}>
                      Show {tableById.get(t)?.name}
                    </Button>
                  ))}
                </Row>
              ) : null}
            </Column>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

export function TablePanel() {
  const { selectedTable, occupants, countAt, brokenTables, rules, unseat, held, place, hold } = usePlan();
  const def = selectedTable ? tableById.get(selectedTable) : undefined;
  if (!def) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who is seated and what they can eat.
        </Text>
      </Column>
    );
  }
  const slots = occupants(def.id);
  const diets = new Map<string, number>();
  for (const id of slots) {
    const d = id ? guestById.get(id)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const issues = rules.filter((r) => r.status === "broken" && r.tableIds.includes(def.id));
  const used = countAt(def.id);
  const heldGuest = held ? guestById.get(held) : undefined;

  return (
    <Column background="surface" border={brokenTables.has(def.id) ? "danger-medium" : true} radius="l" padding="16" gap="12">
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          {def.name}
        </Heading>
        <Tag size="s" tone={used === def.seats ? "warning" : "neutral"} label={`${used} of ${def.seats} seats`} />
      </Row>

      {issues.map((r) => (
        <Row key={r.id} gap="8" padding="8" radius="m" background="danger-alpha-weak" vertical="start">
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Text textVariant="body-default-s">
            {r.title}: {r.detail}
          </Text>
        </Row>
      ))}

      {heldGuest ? (
        <Button size="s" prefixIcon="plus" onClick={() => place(heldGuest.id, def.id)}>
          Seat {heldGuest.name} here
        </Button>
      ) : null}

      <Column as="ul" gap="2" margin="0" padding="0">
        {slots.map((id, i) => {
          const g = id ? guestById.get(id) : undefined;
          return (
            <Row as="li" key={`${def.id}-${i}`} gap="12" vertical="center" paddingY="4" minHeight="40">
              <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ width: "1.25rem", textAlign: "right" }}>
                {i + 1}
              </Text>
              {g ? (
                <>
                  <Avatarish name={g.name} active={held === g.id} />
                  <Column flex={1} gap="2">
                    <Text textVariant="label-strong-s">{g.name}</Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {g.party}
                    </Text>
                  </Column>
                  <Tag size="s" tone={g.diet ? "warning" : "neutral"} label={g.diet ?? "No dietary needs"} />
                  <IconButton
                    icon="personRemove"
                    variant="tertiary"
                    size="s"
                    tooltip="Unseat"
                    aria-label={`Unseat ${g.name}`}
                    onClick={() => unseat(g.id)}
                  />
                  <IconButton
                    icon={held === g.id ? "close" : "arrowRight"}
                    variant="tertiary"
                    size="s"
                    tooltip={held === g.id ? "Cancel move" : "Move to another seat"}
                    aria-label={held === g.id ? `Cancel moving ${g.name}` : `Move ${g.name}`}
                    onClick={() => hold(held === g.id ? null : g.id)}
                  />
                </>
              ) : (
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Empty seat
                </Text>
              )}
            </Row>
          );
        })}
      </Column>

      <Column gap="4" borderTop paddingTop="12">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          DIETARY NEEDS AT THIS TABLE
        </Text>
        <Text textVariant="body-default-s">
          {diets.size
            ? Array.from(diets.entries())
                .map(([d, n]) => `${n} × ${d}`)
                .join(", ")
            : "None recorded"}
        </Text>
      </Column>
    </Column>
  );
}
