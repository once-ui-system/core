"use client";

import { useState, type DragEvent } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconCircleDashed, IconUserMinus } from "@tabler/icons-react";
import type { Guest } from "@/lib/data";
import { partyColor, tableById, type RuleResult } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { DietBadge, PartyDot, RsvpBadge } from "./ui";

function GuestRow({ guest, showRsvp }: { guest: Guest; showRsvp?: boolean }) {
  const { heldId, hold, selectTable } = usePlan();
  const held = heldId === guest.id;
  const c = partyColor(guest.party);
  return (
    <UnstyledButton
      className="mantine-focus-auto"
      draggable
      aria-pressed={held}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${
        held ? "Picked up, press to put down" : "Press to pick up, then choose a table"
      }`}
      onDragStart={(e: DragEvent<HTMLButtonElement>) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => {
        hold(held ? null : guest.id);
        if (!held) selectTable(null);
      }}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        cursor: "grab",
        background: held ? "var(--mantine-color-fig-0)" : "var(--mantine-color-white)",
        border: held ? "2px solid var(--mantine-color-fig-6)" : "1px solid var(--mantine-color-gray-3)",
        borderLeft: `5px solid var(--mantine-color-${c}-6)`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} truncate>
            {guest.name}
          </Text>
          <Text size="xs" c="gray.7" truncate>
            {guest.party}
          </Text>
        </div>
        <Group gap={4} wrap="nowrap">
          {showRsvp && <RsvpBadge rsvp={guest.rsvp} />}
          <DietBadge diet={guest.diet} />
        </Group>
      </Group>
    </UnstyledButton>
  );
}

export function UnseatedList() {
  const { unseated, tentative, unseat, seats } = usePlan();
  const [over, setOver] = useState(false);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      setOver(true);
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id && seats[id]) unseat(id);
  };

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={over ? { borderColor: "var(--mantine-color-fig-5)", background: "var(--mantine-color-fig-0)" } : undefined}
    >
      <Group justify="space-between" mb="xs">
        <Title order={2} size="h5">
          Needs a seat
        </Title>
        <Badge color={unseated.length ? "orange" : "green"} variant="light" size="lg" aria-label={`${unseated.length} attending guests without a seat`}>
          {unseated.length}
        </Badge>
      </Group>
      {unseated.length === 0 ? (
        <Group gap={6}>
          <IconCircleCheck size={18} color="var(--mantine-color-green-7)" />
          <Text size="sm" c="gray.8">
            Everyone attending has a seat.
          </Text>
        </Group>
      ) : (
        <Stack gap={6} component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {unseated.map((guest) => (
            <li key={guest.id}>
              <GuestRow guest={guest} />
            </li>
          ))}
        </Stack>
      )}
      <Text size="xs" c="gray.7" mt="sm">
        Drop a seated guest here to unseat them.
      </Text>

      {tentative.length > 0 && (
        <Box mt="md">
          <Text size="xs" fw={700} tt="uppercase" c="gray.7" mb={6}>
            Not confirmed ({tentative.length})
          </Text>
          <Stack gap={6} component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tentative.map((guest) => (
              <li key={guest.id}>
                <GuestRow guest={guest} showRsvp />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

export function TablePanel() {
  const { selectedTableId, tableSeats, flagged, heldId, hold, unseat, place, selectTable } = usePlan();

  if (!selectedTableId) {
    return (
      <Paper withBorder radius="lg" p="md">
        <Title order={2} size="h5">
          Table details
        </Title>
        <Text size="sm" c="gray.8" mt={4}>
          Select a table on the plan to see who sits there and their dietary needs.
        </Text>
      </Paper>
    );
  }
  const table = tableById[selectedTableId];
  const row = tableSeats[table.id] ?? [];
  const guests = row.filter((x): x is Guest => x !== null);
  const diets = new Map<string, number>();
  for (const guest of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const issues = flagged[table.id] ?? [];

  return (
    <Paper withBorder radius="lg" p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Title order={2} size="h5">
            {table.name}
          </Title>
          <Text size="sm" c="gray.8">
            {guests.length} of {table.seats} seats filled
          </Text>
        </div>
        <Button size="compact-xs" variant="subtle" color="gray.8" onClick={() => selectTable(null)}>
          Close
        </Button>
      </Group>
      <Progress
        value={(guests.length / table.seats) * 100}
        mt="xs"
        size="sm"
        aria-label={`${guests.length} of ${table.seats} seats filled`}
        color={guests.length === table.seats ? "green" : "fig"}
      />

      {issues.length > 0 && (
        <Stack gap={4} mt="sm">
          {issues.map((r) => (
            <Group key={r.index} gap={6} wrap="nowrap" align="flex-start">
              <IconAlertTriangle size={16} color="var(--mantine-color-red-7)" style={{ flex: "none", marginTop: 2 }} />
              <Text size="xs" c="red.9">
                {r.label}: {r.names.join(" & ")}. {r.message}
              </Text>
            </Group>
          ))}
        </Stack>
      )}

      <Box mt="sm">
        <Text size="xs" fw={700} tt="uppercase" c="gray.7" mb={4}>
          Dietary needs
        </Text>
        {diets.size === 0 ? (
          <Text size="sm" c="gray.8">
            None at this table.
          </Text>
        ) : (
          <Group gap={6}>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Badge key={diet} color="orange" variant="light" style={{ textTransform: "none" }}>
                {n} × {diet}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      <Stack gap={4} mt="md" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {row.map((guest, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
              borderTop: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Text size="xs" c="gray.7" w={18} ta="right" aria-label={`Seat ${i + 1}`}>
              {i + 1}
            </Text>
            {guest ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <PartyDot party={guest.party} />
                    <Text size="sm" fw={600} truncate>
                      {guest.name}
                    </Text>
                  </Group>
                  <Group gap={6} mt={2} wrap="wrap">
                    <Text size="xs" c="gray.7">
                      {guest.party}
                    </Text>
                    <DietBadge diet={guest.diet} />
                  </Group>
                </div>
                <Group gap={4} wrap="nowrap">
                  <Button
                    size="compact-xs"
                    variant={heldId === guest.id ? "filled" : "default"}
                    aria-label={`${heldId === guest.id ? "Cancel moving" : "Move"} ${guest.name}`}
                    onClick={() => hold(heldId === guest.id ? null : guest.id)}
                  >
                    {heldId === guest.id ? "Moving" : "Move"}
                  </Button>
                  <Button
                    size="compact-xs"
                    variant="default"
                    aria-label={`Unseat ${guest.name}`}
                    leftSection={<IconUserMinus size={12} />}
                    onClick={() => unseat(guest.id)}
                  >
                    Unseat
                  </Button>
                </Group>
              </>
            ) : (
              <Group justify="space-between" style={{ flex: 1 }} wrap="nowrap">
                <Text size="sm" c="gray.7" fs="italic">
                  Empty seat
                </Text>
                {heldId && (
                  <Button size="compact-xs" onClick={() => place(heldId, table.id, i)} aria-label={`Seat held guest in seat ${i + 1}`}>
                    Seat here
                  </Button>
                )}
              </Group>
            )}
          </li>
        ))}
      </Stack>
    </Paper>
  );
}

function RuleIcon({ status }: { status: RuleResult["status"] }) {
  if (status === "broken") return <IconAlertTriangle size={18} color="var(--mantine-color-red-7)" aria-hidden />;
  if (status === "open") return <IconCircleDashed size={18} color="var(--mantine-color-gray-7)" aria-hidden />;
  return <IconCircleCheck size={18} color="var(--mantine-color-green-7)" aria-hidden />;
}

const STATUS_TEXT: Record<RuleResult["status"], string> = {
  broken: "Broken",
  open: "Waiting for seats",
  ok: "Kept",
};
const STATUS_ORDER: Record<RuleResult["status"], number> = { broken: 0, open: 1, ok: 2 };

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const sorted = [...results].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <Paper withBorder radius="lg" p="md">
      <Title order={2} size="h5">
        The couple&apos;s rules
      </Title>
      <Text
        size="sm"
        mt={4}
        fw={600}
        c={broken ? "red.9" : "green.9"}
        role="status"
      >
        {broken === 0
          ? "No rule is broken."
          : `${broken} rule${broken > 1 ? "s" : ""} broken.`}
        {open > 0 ? ` ${open} waiting for seats.` : ""}
      </Text>
      <Stack gap="sm" mt="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sorted.map((r) => (
          <li key={r.index}>
            <Group gap={8} wrap="nowrap" align="flex-start">
              <Box mt={2} style={{ flex: "none" }}>
                <RuleIcon status={r.status} />
              </Box>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={600}>
                  {r.label}: {r.names.join(" & ")}
                  <Text span size="xs" c={r.status === "broken" ? "red.9" : "gray.7"} fw={600}>
                    {" "}
                    · {STATUS_TEXT[r.status]}
                  </Text>
                </Text>
                <Text size="xs" c="gray.8">
                  {r.message}
                </Text>
                <Text size="xs" c="gray.7" fs="italic">
                  {r.rule.note}
                </Text>
                {r.status === "broken" && r.tableIds.length > 0 && (
                  <Group gap={4} mt={4}>
                    {r.tableIds.map((id) => (
                      <Button key={id} size="compact-xs" variant="light" color="red" onClick={() => selectTable(id)}>
                        Show {tableById[id]?.name}
                      </Button>
                    ))}
                  </Group>
                )}
              </div>
            </Group>
          </li>
        ))}
      </Stack>
    </Paper>
  );
}
