"use client";

import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowsMove,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconMapPin,
  IconUserMinus,
} from "@tabler/icons-react";
import type { DragEvent } from "react";
import {
  DIET_COLOR,
  GUESTS,
  GUESTS_BY_ID,
  PARTY_COLOR,
  PARTY_ORDER,
  TABLES,
  TABLES_BY_ID,
  initials,
  type Table,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import type { RuleResult, RuleStatus } from "@/lib/rules";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

export type PanelTab = "seat" | "table" | "rules";

const STATUS_COLOR: Record<RuleStatus, string> = { ok: "green", broken: "red", pending: "gray" };
const STATUS_LABEL: Record<RuleStatus, string> = { ok: "Kept", broken: "Broken", pending: "Not placed yet" };

function StatusIcon({ status }: { status: RuleStatus }) {
  const color = `var(--mantine-color-${STATUS_COLOR[status]}-${status === "pending" ? 6 : 7})`;
  if (status === "ok") return <IconCheck size={18} color={color} aria-hidden />;
  if (status === "broken") return <IconAlertTriangle size={18} color={color} aria-hidden />;
  return <IconClock size={18} color={color} aria-hidden />;
}

function ToSeatPanel() {
  const plan = usePlan();
  const order = (party: string) => PARTY_ORDER.indexOf(party);
  const sorter = (a: { party: string; name: string }, b: { party: string; name: string }) =>
    order(a.party) - order(b.party) || a.name.localeCompare(b.name);
  const toSeat = GUESTS.filter((x) => x.rsvp === "yes" && !plan.locations[x.id]).sort(sorter);
  const awaiting = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.locations[x.id],
  ).sort(sorter);

  const dragSeated = plan.dragId ? Boolean(plan.locations[plan.dragId]) : false;
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (dragSeated) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
    if (id) plan.unseat(id);
  };

  return (
    <Stack
      gap="sm"
      p="xs"
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cx(classes.dropZone, dragSeated && classes.dropZoneActive)}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      {dragSeated ? (
        <Paper p="md" withBorder style={{ borderStyle: "dashed" }} ta="center">
          <Text fz="sm" fw={600}>
            Drop here to unseat
          </Text>
        </Paper>
      ) : null}

      <Group justify="space-between" align="baseline">
        <Text fz="sm" fw={700}>
          Attending, no seat yet
        </Text>
        <Badge variant="light" color={toSeat.length ? "orange" : "green"} size="lg">
          {toSeat.length}
        </Badge>
      </Group>

      {toSeat.length === 0 ? (
        <Paper withBorder p="md" bg="green.0">
          <Group gap="xs" wrap="nowrap">
            <IconCheck size={18} color="var(--mantine-color-green-8)" aria-hidden />
            <Text fz="sm">Everyone who is attending has a seat.</Text>
          </Group>
        </Paper>
      ) : (
        <Stack gap={6} role="list" aria-label="Attending guests without a seat">
          {toSeat.map((x) => (
            <div key={x.id} role="listitem">
              <GuestChip guest={x} />
            </div>
          ))}
        </Stack>
      )}

      {awaiting.length > 0 ? (
        <>
          <Divider my={4} />
          <Group justify="space-between" align="baseline">
            <Text fz="sm" fw={700}>
              Awaiting a reply
            </Text>
            <Badge variant="light" color="gray" size="lg">
              {awaiting.length}
            </Badge>
          </Group>
          <Text fz="xs" c="gray.7">
            Not confirmed yet. You can hold a seat for them, or leave them off the plan.
          </Text>
          <Stack gap={6} role="list" aria-label="Guests who have not confirmed">
            {awaiting.map((x) => (
              <div key={x.id} role="listitem">
                <GuestChip guest={x} />
              </div>
            ))}
          </Stack>
        </>
      ) : null}

      <Text fz="xs" c="gray.7" mt={4}>
        Tap a guest, then a seat or table. On a mouse you can also drag. {plan.counts.declined} declined and
        are not listed.
      </Text>
    </Stack>
  );
}

function TableList() {
  const plan = usePlan();
  return (
    <Stack gap={4} p="xs">
      <Text fz="sm" fw={700} mb={4}>
        All tables
      </Text>
      {TABLES.map((t) => {
        const filled = (plan.seating[t.id] ?? []).filter(Boolean).length;
        const broken = plan.brokenTableIds.has(t.id);
        return (
          <button
            key={t.id}
            type="button"
            className={classes.rowButton}
            onClick={() => plan.selectTable(t.id)}
          >
            <Box p="xs">
              <Group justify="space-between" wrap="nowrap" mb={6}>
                <Group gap={6} wrap="nowrap">
                  <Text fz="sm" fw={600}>
                    {t.name}
                  </Text>
                  {broken ? (
                    <IconAlertTriangle size={15} color="var(--mantine-color-red-7)" aria-hidden />
                  ) : null}
                </Group>
                <Text fz="sm" c="gray.7">
                  {filled}/{t.seats} seats
                </Text>
              </Group>
              <Progress
                value={(filled / t.seats) * 100}
                size="sm"
                color={filled === t.seats ? "green" : "brand"}
                aria-hidden
              />
            </Box>
          </button>
        );
      })}
    </Stack>
  );
}

function dietSummary(table: Table, seats: (string | null)[]) {
  const counts = new Map<string, number>();
  for (const id of seats) {
    const diet = id ? GUESTS_BY_ID[id]?.diet : null;
    if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
  }
  return { table, counts: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
}

function TableDetail({ tableId, onSeeRules }: { tableId: string; onSeeRules: () => void }) {
  const plan = usePlan();
  const table = TABLES_BY_ID[tableId];
  if (!table) return null;
  const seats = plan.seating[tableId] ?? [];
  const filled = seats.filter(Boolean).length;
  const armedGuest = plan.armedGuestId ? GUESTS_BY_ID[plan.armedGuestId] : null;
  const rules = plan.brokenRules.filter((r) => r.tableIds.includes(tableId));
  const diets = dietSummary(table, seats).counts;
  const standard = seats.filter((id) => id && !GUESTS_BY_ID[id]?.diet).length;

  return (
    <Stack gap="sm" p="xs">
      <Group justify="space-between" wrap="nowrap">
        <Button
          variant="subtle"
          size="compact-sm"
          color="gray.7"
          leftSection={<IconChevronLeft size={16} aria-hidden />}
          onClick={() => plan.selectTable(null)}
        >
          All tables
        </Button>
        <Badge variant="light" color={filled === table.seats ? "green" : "brand"} size="lg">
          {filled} of {table.seats} seats
        </Badge>
      </Group>
      <Title order={3} fz="xl">
        {table.name}
      </Title>

      {rules.map((r) => (
        <Alert
          key={r.rule.id}
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} aria-hidden />}
          title={r.label}
          p="sm"
        >
          <Text fz="sm">{r.detail}</Text>
          {r.hint ? (
            <Text fz="xs" mt={4}>
              {r.hint}
            </Text>
          ) : null}
        </Alert>
      ))}
      {rules.length > 0 ? (
        <Button variant="subtle" size="compact-sm" onClick={onSeeRules} style={{ alignSelf: "flex-start" }}>
          See all rules
        </Button>
      ) : null}

      <Stack gap={2} role="list" aria-label={`${table.name} seats`}>
        {seats.map((id, index) => {
          const guest = id ? GUESTS_BY_ID[id] : null;
          const isArmed = guest ? plan.armedGuestId === guest.id : false;
          return (
            <Group
              key={`${tableId}-${index}`}
              role="listitem"
              wrap="nowrap"
              gap="xs"
              p={6}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                background: isArmed ? "var(--mantine-color-brand-0)" : undefined,
              }}
            >
              <Text w={18} fz="xs" c="gray.7" ta="right" aria-hidden>
                {index + 1}
              </Text>
              {guest ? (
                <>
                  <Avatar size={30} radius="xl" variant="filled" color={PARTY_COLOR[guest.party] ?? "gray"} fz={11} fw={700}>
                    {initials(guest.name)}
                  </Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate lh={1.25}>
                      {guest.name}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      <Text fz="xs" c="gray.7" truncate lh={1.25}>
                        {guest.party}
                      </Text>
                    </Group>
                  </Box>
                  {guest.diet ? (
                    <Badge size="sm" variant="light" color={DIET_COLOR[guest.diet] ?? "gray"}>
                      {guest.diet}
                    </Badge>
                  ) : null}
                  <ActionIcon
                    variant={isArmed ? "filled" : "subtle"}
                    color="brand"
                    size={32}
                    aria-label={`Move ${guest.name} to another seat`}
                    aria-pressed={isArmed}
                    onClick={() => plan.arm(isArmed ? null : guest.id)}
                  >
                    <IconArrowsMove size={17} aria-hidden />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size={32}
                    aria-label={`Unseat ${guest.name}`}
                    onClick={() => plan.unseat(guest.id)}
                  >
                    <IconUserMinus size={17} aria-hidden />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Box
                    w={30}
                    h={30}
                    style={{
                      borderRadius: "50%",
                      border: "2px dashed var(--mantine-color-gray-5)",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <Text fz="sm" c="gray.7" style={{ flex: 1 }}>
                    Empty seat
                  </Text>
                  {armedGuest ? (
                    <Button
                      size="compact-sm"
                      variant="light"
                      onClick={() => plan.seatGuest(armedGuest.id, tableId, index)}
                    >
                      Seat {armedGuest.name.split(" ")[0]} here
                    </Button>
                  ) : null}
                </>
              )}
            </Group>
          );
        })}
      </Stack>

      <Divider />
      <Box>
        <Text fz="sm" fw={700} mb={6}>
          Dietary needs at this table
        </Text>
        {diets.length === 0 ? (
          <Text fz="sm" c="gray.7">
            {filled === 0 ? "Nobody is seated here yet." : "None. Everyone is on the standard menu."}
          </Text>
        ) : (
          <Group gap={6}>
            {diets.map(([diet, n]) => (
              <Badge key={diet} variant="light" color={DIET_COLOR[diet] ?? "gray"} size="lg">
                {diet} &times; {n}
              </Badge>
            ))}
            {standard > 0 ? (
              <Badge variant="outline" color="gray" size="lg">
                Standard &times; {standard}
              </Badge>
            ) : null}
          </Group>
        )}
      </Box>
    </Stack>
  );
}

function RuleCard({ result, onShow }: { result: RuleResult; onShow: (r: RuleResult) => void }) {
  const color = STATUS_COLOR[result.status];
  return (
    <Paper
      withBorder
      p="sm"
      style={{
        borderLeft: `4px solid var(--mantine-color-${color}-${result.status === "pending" ? 5 : 7})`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" mb={4}>
        <Group gap={8} wrap="nowrap">
          <StatusIcon status={result.status} />
          <Text fz="sm" fw={700}>
            {result.label}
          </Text>
        </Group>
        <Badge size="sm" variant="light" color={color}>
          {STATUS_LABEL[result.status]}
        </Badge>
      </Group>
      <Text fz="sm">{result.detail}</Text>
      {result.hint ? (
        <Text fz="xs" c="gray.7" mt={4}>
          {result.hint}
        </Text>
      ) : null}
      <Text fz="xs" c="gray.7" mt={6} fs="italic">
        Couple's note: {result.rule.note}
      </Text>
      {result.rule.caveat ? (
        <Text fz="xs" mt={6} c="yellow.9">
          Check: {result.rule.caveat}
        </Text>
      ) : null}
      {result.tableIds.length > 0 ? (
        <Button
          mt={8}
          size="compact-sm"
          variant="subtle"
          leftSection={<IconMapPin size={15} aria-hidden />}
          onClick={() => onShow(result)}
        >
          Show {result.status === "pending" ? "fitting " : ""}
          {result.tableIds.length > 1 ? "tables" : "table"}
        </Button>
      ) : null}
    </Paper>
  );
}

function RulesPanel({ onShow }: { onShow: (r: RuleResult) => void }) {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  const ok = plan.rules.filter((r) => r.status === "ok").length;
  const pending = plan.rules.filter((r) => r.status === "pending").length;
  const sorted = [...plan.rules].sort((a, b) => {
    const rank: Record<RuleStatus, number> = { broken: 0, pending: 1, ok: 2 };
    return rank[a.status] - rank[b.status];
  });
  return (
    <Stack gap="sm" p="xs">
      <Group gap={6}>
        <Badge color={broken ? "red" : "green"} variant={broken ? "filled" : "light"} c={broken ? "white" : "dark.9"} size="lg">
          {broken} broken
        </Badge>
        <Badge color="green" variant="light" size="lg">
          {ok} kept
        </Badge>
        <Badge color="gray" variant="light" size="lg">
          {pending} not placed yet
        </Badge>
      </Group>
      <Stack gap="xs">
        {sorted.map((r) => (
          <RuleCard key={r.rule.id} result={r} onShow={onShow} />
        ))}
      </Stack>
    </Stack>
  );
}

export function SidePanel({ tab, setTab }: { tab: PanelTab; setTab: (t: PanelTab) => void }) {
  const plan = usePlan();

  const showRule = (r: RuleResult) => {
    const first = r.tableIds[0];
    if (first) plan.selectTable(first);
    setTab("table");
  };

  return (
    <Paper withBorder shadow="xs" style={{ overflow: "hidden" }}>
      <Tabs value={tab} onChange={(v) => v && setTab(v as PanelTab)} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="seat" rightSection={<Badge size="sm" circle variant="light" color={plan.counts.toSeat ? "orange" : "green"}>{plan.counts.toSeat}</Badge>}>
            To seat
          </Tabs.Tab>
          <Tabs.Tab value="table">Table</Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              plan.brokenRules.length ? (
                <Badge size="sm" circle color="red" c="white">
                  {plan.brokenRules.length}
                </Badge>
              ) : null
            }
          >
            Rules
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="seat" p="xs">
          <ToSeatPanel />
        </Tabs.Panel>
        <Tabs.Panel value="table" p="xs">
          {plan.selectedTableId ? (
            <TableDetail tableId={plan.selectedTableId} onSeeRules={() => setTab("rules")} />
          ) : (
            <TableList />
          )}
        </Tabs.Panel>
        <Tabs.Panel value="rules" p="xs">
          <RulesPanel onShow={showRule} />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
