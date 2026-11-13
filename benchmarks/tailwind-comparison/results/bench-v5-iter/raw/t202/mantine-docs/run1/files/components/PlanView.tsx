"use client";

import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCheck,
  IconHandFinger,
  IconMapPin,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { EVENT, GUESTS_BY_ID, formatEventDate } from "@/lib/data";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { SidePanel, type PanelTab } from "./SidePanel";

function Stat({
  label,
  value,
  note,
  tone = "dark",
  children,
}: {
  label: string;
  value: ReactNode;
  note: string;
  tone?: string;
  children?: ReactNode;
}) {
  return (
    <Paper withBorder p="sm" shadow="xs">
      <Text fz="xs" fw={600} c="gray.7" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
        {label}
      </Text>
      <Group gap={6} align="baseline" wrap="nowrap">
        <Text fz={28} fw={800} lh={1.15} c={tone}>
          {value}
        </Text>
        <Text fz="sm" c="gray.7">
          {note}
        </Text>
      </Group>
      {children}
    </Paper>
  );
}

export function PlanView() {
  const plan = usePlan();
  const [tab, setTab] = useState<PanelTab>(plan.selectedTableId ? "table" : "seat");
  const { counts, brokenRules } = plan;
  const armed = plan.armedGuestId ? GUESTS_BY_ID[plan.armedGuestId] : null;

  const confirmReset = () =>
    modals.openConfirmModal({
      title: "Reset the plan?",
      centered: true,
      children: (
        <Text fz="sm">
          Every guest goes back to the starting arrangement and your changes in this session are lost.
        </Text>
      ),
      labels: { confirm: "Reset plan", cancel: "Keep my plan" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        plan.reset();
        setTab("seat");
      },
    });

  return (
    <Stack gap="md" maw={1700} mx="auto">
      <Group justify="space-between" align="flex-end" gap="sm">
        <Box>
          <Title order={1} fz={{ base: 24, sm: 28 }}>
            Seating plan
          </Title>
          <Group gap="md" mt={4} c="gray.7">
            <Group gap={6} wrap="nowrap">
              <IconCalendarEvent size={16} aria-hidden />
              <Text fz="sm">{formatEventDate(EVENT.date)}</Text>
            </Group>
            <Group gap={6} wrap="nowrap">
              <IconMapPin size={16} aria-hidden />
              <Text fz="sm">
                {EVENT.venue} &middot; {EVENT.room.width} &times; {EVENT.room.depth} m
              </Text>
            </Group>
          </Group>
        </Box>
        <Button
          variant="default"
          leftSection={<IconRefresh size={16} aria-hidden />}
          onClick={confirmReset}
          disabled={!plan.isDirty}
        >
          Reset plan
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Stat label="Seated" value={counts.seated} note={`of ${counts.seatsTotal} seats`}>
          <Progress
            mt={8}
            size="sm"
            value={(counts.seated / counts.seatsTotal) * 100}
            aria-label={`${counts.seated} of ${counts.seatsTotal} seats filled`}
          />
        </Stat>
        <Stat
          label="Still to seat"
          value={counts.toSeat}
          note={`of ${counts.attending} attending`}
          tone={counts.toSeat ? "orange.8" : "green.8"}
        />
        <Stat label="Awaiting reply" value={counts.awaiting} note="maybe or no reply" />
        <Stat
          label="Couple's rules"
          value={brokenRules.length}
          note="broken"
          tone={brokenRules.length ? "red.8" : "green.8"}
        />
      </SimpleGrid>

      {brokenRules.length > 0 ? (
        <Alert
          color="red"
          variant="light"
          role="region"
          aria-label="Broken rules"
          icon={<IconAlertTriangle size={20} aria-hidden />}
          title={brokenRules.length === 1 ? "1 rule is broken" : `${brokenRules.length} rules are broken`}
        >
          <Stack gap={4}>
            {brokenRules.map((r) => (
              <Group key={r.rule.id} gap="xs" justify="space-between" wrap="nowrap" align="flex-start">
                <Text fz="sm">
                  <b>{r.label}:</b> {r.detail}
                </Text>
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="red"
                  style={{ flexShrink: 0 }}
                  onClick={() => {
                    const first = r.tableIds[0];
                    if (first) plan.selectTable(first);
                    setTab("table");
                  }}
                >
                  Show
                </Button>
              </Group>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert
          color="green"
          variant="light"
          role="region"
          aria-label="Rules"
          icon={<IconCheck size={20} aria-hidden />}
          py="xs"
        >
          None of the couple's rules is broken right now.
        </Alert>
      )}

      {armed ? (
        <Alert
          color="brand"
          variant="filled"
          role="region"
          aria-label="Placing a guest"
          icon={<IconHandFinger size={20} aria-hidden />}
          py="xs"
          style={{ position: "sticky", top: 68, zIndex: 30 }}
        >
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text fz="sm" fw={600}>
              Placing {armed.name}: tap a seat or a table. Esc cancels.
            </Text>
            <Button
              size="compact-sm"
              variant="white"
              color="brand"
              leftSection={<IconX size={15} aria-hidden />}
              onClick={() => plan.arm(null)}
            >
              Cancel
            </Button>
          </Group>
        </Alert>
      ) : null}

      <Flex direction={{ base: "column", md: "row" }} gap="md" align="flex-start">
        <Box style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Paper withBorder p="sm" shadow="xs">
            <RoomPlan onTableChosen={() => setTab("table")} />
          </Paper>
        </Box>
        <Box
          w={{ base: "100%", md: 330, xl: 390 }}
          style={{ flexShrink: 0, overflowY: "auto" }}
          pos={{ base: "static", md: "sticky" }}
          top={{ md: 76 }}
          mah={{ md: "calc(100vh - 92px)" }}
        >
          <SidePanel tab={tab} setTab={setTab} />
        </Box>
      </Flex>
    </Stack>
  );
}
