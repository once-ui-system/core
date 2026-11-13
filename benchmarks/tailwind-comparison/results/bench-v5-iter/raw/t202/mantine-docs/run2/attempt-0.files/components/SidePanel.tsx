"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconArmchair,
  IconArrowsExchange,
  IconCheck,
  IconClock,
  IconHandClick,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { guests, tables } from "@/lib/data";
import {
  conflictsIfPlaced,
  guestById,
  initials,
  occupants,
  tableById,
} from "@/lib/plan";
import { DietBadge, PartyBadge, partyColor } from "./GuestBits";
import { usePlan } from "./PlanProvider";

// ------------------------------------------------------------ move / seat menu

function SeatMenuItems({ guestId, excludeTable }: { guestId: string; excludeTable?: string }) {
  const { seating, place } = usePlan();
  const options = tables.filter((t) => t.id !== excludeTable);
  return (
    <>
      <Menu.Label>{excludeTable ? "Move to" : "Seat at"}</Menu.Label>
      {options.map((t) => {
        const free = occupants(seating, t.id).filter((o) => !o).length;
        const clash = free > 0 ? conflictsIfPlaced(seating, guestId, t.id) : [];
        return (
          <Menu.Item
            key={t.id}
            disabled={free === 0}
            onClick={() => place(guestId, t.id)}
            color={clash.length > 0 ? "red" : undefined}
            rightSection={
              <Text size="xs" c={free === 0 ? "dimmed" : clash.length > 0 ? "red" : "dimmed"}>
                {free === 0 ? "Full" : clash.length > 0 ? `Breaks: ${clash[0]?.label.toLowerCase()}` : `${free} free`}
              </Text>
            }
          >
            {t.name}
          </Menu.Item>
        );
      })}
    </>
  );
}

function SeatMenu({ guestId, excludeTable }: { guestId: string; excludeTable?: string }) {
  const guest = guestById[guestId];
  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={250}>
      <Menu.Target>
        <Button
          size="compact-sm"
          variant="light"
          leftSection={excludeTable ? <IconArrowsExchange size={14} /> : <IconArmchair size={14} />}
          aria-label={`${excludeTable ? "Move" : "Seat"} ${guest?.name ?? "guest"}`}
        >
          {excludeTable ? "Move" : "Seat"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <SeatMenuItems guestId={guestId} excludeTable={excludeTable} />
      </Menu.Dropdown>
    </Menu>
  );
}

// -------------------------------------------------------------------- rows

function GuestRow({ guestId, seat, tableId }: { guestId: string; seat?: number; tableId?: string }) {
  const { picked, dragId, pick, unseat, setDragId } = usePlan();
  const guest = guestById[guestId];
  if (!guest) return null;
  const isPicked = picked === guestId;
  const color = partyColor(guest.party);
  return (
    <Paper
      withBorder
      p="xs"
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guestId);
      }}
      onDragEnd={() => setDragId(null)}
      style={{
        cursor: "grab",
        opacity: dragId === guestId ? 0.5 : 1,
        borderColor: isPicked ? "var(--mantine-color-brand-filled)" : undefined,
        boxShadow: isPicked ? "0 0 0 2px var(--mantine-color-brand-filled)" : undefined,
        background: isPicked ? "var(--mantine-color-brand-light)" : undefined,
      }}
    >
      <Group wrap="nowrap" gap="xs" justify="space-between">
        <UnstyledButton
          onClick={() => pick(isPicked ? null : guestId)}
          aria-pressed={isPicked}
          style={{ flex: 1, minWidth: 0, touchAction: "manipulation" }}
        >
          <Group gap="sm" wrap="nowrap">
            <Avatar color={color} radius="xl" size={34}>
              {seat !== undefined ? seat + 1 : initials(guest.name)}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {guest.name}
              </Text>
              <Group gap={6} wrap="wrap">
                <Text size="xs" c="dimmed">
                  {guest.party}
                  {guest.rsvp === "maybe" ? " · maybe" : guest.rsvp === "pending" ? " · awaiting reply" : ""}
                </Text>
                <DietBadge diet={guest.diet} />
              </Group>
            </Box>
          </Group>
        </UnstyledButton>
        <Group gap={6} wrap="nowrap">
          <SeatMenu guestId={guestId} excludeTable={tableId} />
          {tableId ? (
            <Tooltip label="Unseat">
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={`Unseat ${guest.name}`}
                onClick={() => unseat(guestId)}
              >
                <IconUserMinus size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      </Group>
    </Paper>
  );
}

// ---------------------------------------------------------------- to seat

function ToSeat() {
  const { seating, dragId, unseat } = usePlan();
  const [dropOver, setDropOver] = useState(false);
  const yes = guests.filter((g) => g.rsvp === "yes" && !seating[g.id]);
  const undecided = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id]);
  const dragSeated = dragId ? Boolean(seating[dragId]) : false;

  return (
    <Stack
      gap="xs"
      p="xs"
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!dragSeated) return;
        e.preventDefault();
        setDropOver(true);
      }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDropOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) unseat(id);
      }}
      style={{
        borderRadius: 8,
        outline: dropOver ? "2px dashed var(--mantine-color-brand-filled)" : undefined,
        background: dropOver ? "var(--mantine-color-brand-light)" : undefined,
      }}
    >
      <Text size="xs" c="dimmed">
        Tap a guest, then a table or an empty seat. Or drag them onto the plan.
        {dragSeated ? " Drop here to unseat." : ""}
      </Text>
      {yes.length === 0 ? (
        <Alert color="teal" icon={<IconCheck size={16} />} title="Everyone attending has a seat" />
      ) : (
        yes.map((g) => <GuestRow key={g.id} guestId={g.id} />)
      )}
      {undecided.length > 0 ? (
        <>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mt="sm">
            Not confirmed yet ({undecided.length})
          </Text>
          {undecided.map((g) => (
            <GuestRow key={g.id} guestId={g.id} />
          ))}
        </>
      ) : null}
    </Stack>
  );
}

// ------------------------------------------------------------- table panel

function TableDetails() {
  const { seating, selectedTable, rules, selectTable, place } = usePlan();
  const table = selectedTable ? tableById[selectedTable] : undefined;

  if (!table) {
    return (
      <Stack align="center" gap="xs" p="xl" ta="center">
        <ThemeIcon variant="light" size={44} radius="xl">
          <IconHandClick size={24} />
        </ThemeIcon>
        <Text fw={600}>No table selected</Text>
        <Text size="sm" c="dimmed">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Stack>
    );
  }

  const occ = occupants(seating, table.id);
  const seated = occ.flatMap((id, seat) => (id ? [{ id, seat }] : []));
  const emptySeats = occ.length - seated.length;
  const dietCounts = new Map<string, number>();
  for (const { id } of seated) {
    const d = guestById[id]?.diet;
    if (d) dietCounts.set(d, (dietCounts.get(d) ?? 0) + 1);
  }
  const broken = rules.filter((r) => r.status === "broken" && r.tables.includes(table.id));
  const candidates = guests
    .filter((g) => g.rsvp !== "no" && !seating[g.id])
    .map((g) => ({ value: g.id, label: `${g.name}${g.rsvp === "yes" ? "" : " (not confirmed)"}` }));

  return (
    <Stack gap="sm" p="xs">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div>
          <Title order={2} size="h4">{table.name}</Title>
          <Text size="sm" c="dimmed">
            {seated.length} of {table.seats} seats filled
            {emptySeats > 0 ? ` · ${emptySeats} free` : " · full"}
          </Text>
        </div>
        <ActionIcon variant="subtle" color="gray" aria-label="Clear selection" onClick={() => selectTable(null)}>
          <IconX size={16} />
        </ActionIcon>
      </Group>
      <Progress
        value={(seated.length / table.seats) * 100}
        color={emptySeats === 0 ? "teal" : "brand"}
        size="sm"
        aria-label={`${seated.length} of ${table.seats} seats filled`}
      />

      {broken.map((r) => (
        <Alert key={r.index} color="red" variant="light" icon={<IconAlertTriangle size={16} />} title={r.label} p="xs">
          <Text size="sm">{r.text}</Text>
        </Alert>
      ))}

      <div>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>
          Dietary needs
        </Text>
        {dietCounts.size === 0 ? (
          <Text size="sm" c="dimmed">
            None recorded for this table.
          </Text>
        ) : (
          <Group gap={6}>
            {Array.from(dietCounts.entries()).map(([diet, n]) => (
              <Badge key={diet} size="md" variant="light" color={/allerg/i.test(diet) ? "red" : "grape"} tt="none">
                {diet} × {n}
              </Badge>
            ))}
          </Group>
        )}
      </div>

      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
        Guests
      </Text>
      {seated.length === 0 ? (
        <Text size="sm" c="dimmed">
          Nobody is seated here yet.
        </Text>
      ) : (
        seated.map(({ id, seat }) => <GuestRow key={id} guestId={id} seat={seat} tableId={table.id} />)
      )}
      {emptySeats > 0 ? (
        <Select
          label={`Seat someone here (${emptySeats} free)`}
          placeholder="Search guests without a seat"
          data={candidates}
          searchable
          clearable
          nothingFoundMessage="Everyone has a seat"
          value={null}
          onChange={(v) => {
            if (v) place(v, table.id);
          }}
        />
      ) : null}
    </Stack>
  );
}

// ------------------------------------------------------------------- rules

function RulesList() {
  const { rules, selectTable } = usePlan();
  return (
    <Stack gap="xs" p="xs">
      {rules.map((r) => {
        const color = r.status === "broken" ? "red" : r.status === "ok" ? "teal" : "gray";
        const Icon = r.status === "broken" ? IconAlertTriangle : r.status === "ok" ? IconCheck : IconClock;
        const first = r.tables[0];
        return (
          <Paper key={r.index} withBorder p="sm" style={{ borderColor: r.status === "broken" ? "var(--mantine-color-red-4)" : undefined }}>
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <ThemeIcon color={color} variant="light" radius="xl" size={30}>
                <Icon size={16} />
              </ThemeIcon>
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} justify="space-between">
                  <Badge variant="outline" color="gray" size="sm" tt="none">
                    {r.label}
                  </Badge>
                  <Text size="xs" fw={700} c={color}>
                    {r.status === "broken" ? "Broken" : r.status === "ok" ? "Followed" : "Waiting"}
                  </Text>
                </Group>
                <Text size="sm">{r.text}</Text>
                <Text size="xs" c="dimmed">
                  {r.rule.note}
                </Text>
                {first ? (
                  <Group gap={6}>
                    {r.tables.map((tid) => (
                      <Button key={tid} size="compact-xs" variant="light" color="red" onClick={() => selectTable(tid, true)}>
                        Show {tableById[tid]?.name}
                      </Button>
                    ))}
                  </Group>
                ) : null}
              </Stack>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}

// ---------------------------------------------------------------- the panel

export function SidePanel() {
  const { stats, rules, selectedTable, revealTick } = usePlan();
  const [tab, setTab] = useState<string | null>("seat");
  const ref = useRef<HTMLDivElement>(null);
  const brokenCount = rules.filter((r) => r.status === "broken").length;
  const unseated = stats.toSeat + stats.undecidedUnseated;
  const table = selectedTable ? tableById[selectedTable] : undefined;

  useEffect(() => {
    if (revealTick === 0) return;
    setTab("table");
    const el = ref.current;
    if (el && window.innerWidth < 1024) {
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight - 160) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [revealTick]);

  return (
    <Paper
      ref={ref}
      withBorder
      p={0}
      role="region"
      style={{ scrollMarginTop: 76 }}
      aria-label="Guests, table details and rules"
    >
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab
            value="seat"
            rightSection={
              <Badge size="sm" circle variant={unseated > 0 ? "filled" : "light"} color={unseated > 0 ? "brand" : "teal"}>
                {unseated}
              </Badge>
            }
          >
            To seat
          </Tabs.Tab>
          <Tabs.Tab value="table">{table ? table.name : "Table"}</Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              brokenCount > 0 ? (
                <Badge size="sm" circle color="red">
                  {brokenCount}
                </Badge>
              ) : null
            }
          >
            Rules
          </Tabs.Tab>
        </Tabs.List>
        <ScrollArea.Autosize mah={{ base: 720, lg: "calc(100dvh - 230px)" }} type="auto" offsetScrollbars>
          <Tabs.Panel value="seat" pt="xs">
            <ToSeat />
          </Tabs.Panel>
          <Tabs.Panel value="table" pt="xs">
            <TableDetails />
          </Tabs.Panel>
          <Tabs.Panel value="rules" pt="xs">
            <RulesList />
          </Tabs.Panel>
        </ScrollArea.Autosize>
      </Tabs>
    </Paper>
  );
}
