"use client";

import {
  type Alarm,
  AlarmList,
  Annunciator,
  Column,
  ConfirmButton,
  Heading,
  Row,
  Schematic,
  type SchematicLink,
  type SchematicNode,
  Text,
  useAlarms,
} from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import { useEffect, useMemo, useState } from "react";

/**
 * The plant observer's core pieces on one page: chart thresholds and
 * annotations, the alarm model with an annunciator and a list, the
 * schematic, and the two-step confirm. A made-up small modular reactor,
 * "Halden SMR"; the numbers are a deterministic loop, not physics.
 */

const POINTS: Alarm[] = [
  {
    id: "temp-hi",
    tag: "TT-101",
    label: "Core outlet temp high",
    priority: "high",
    active: false,
    acknowledged: true,
  },
  {
    id: "temp-trip",
    tag: "TT-101",
    label: "Core outlet temp trip",
    priority: "critical",
    active: false,
    acknowledged: true,
  },
  {
    id: "rcp-b",
    tag: "RCP-B",
    label: "Coolant pump B trip",
    priority: "critical",
    active: false,
    acknowledged: true,
  },
  {
    id: "pzr-lvl",
    tag: "LT-201",
    label: "Pressuriser level low",
    priority: "medium",
    active: true,
    acknowledged: true,
    since: "2026-11-08T13:58:10Z",
  },
  {
    id: "fw-flow",
    tag: "FT-301",
    label: "Feedwater flow low",
    priority: "high",
    active: false,
    acknowledged: true,
  },
  {
    id: "sg-dp",
    tag: "PDT-302",
    label: "Steam generator ΔP",
    priority: "low",
    active: false,
    acknowledged: true,
  },
  {
    id: "cond-vac",
    tag: "PT-401",
    label: "Condenser vacuum low",
    priority: "medium",
    active: false,
    acknowledged: true,
    shelved: true,
  },
  {
    id: "grid-sync",
    tag: "GEN",
    label: "Generator off grid",
    priority: "low",
    active: false,
    acknowledged: true,
  },
];

const START = Date.UTC(2026, 10, 8, 14, 0, 0);
const minute = (i: number) => new Date(START + i * 60_000).toISOString().slice(11, 16);

function temperatureAt(i: number) {
  // A slow rise from 296 °C with a bump that crosses the high alarm at 14:12.
  const base = 296 + i * 0.6 + Math.sin(i / 2.5) * 2;
  const bump = i > 9 && i < 17 ? (8 - Math.abs(i - 13)) * 4.2 : 0;
  return Math.round((base + bump) * 10) / 10;
}

export default function ControlRoom() {
  const plant = useAlarms({ defaultAlarms: POINTS });
  const [tick, setTick] = useState(24);
  const [tripped, setTripped] = useState(false);
  const [pumpB, setPumpB] = useState(true);

  // A scripted shift: the high alarm comes in, pump B trips, the alarm clears.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the script runs once; raise and clear are stable.
  useEffect(() => {
    const at = (t: number) => new Date(START + t * 60_000);
    plant.raise("temp-hi", { at: at(12), detail: "331 °C, limit 325 °C" });
    const timers = [
      setTimeout(() => {
        plant.raise("rcp-b", { at: at(14), detail: "Motor overcurrent" });
        setPumpB(false);
      }, 1500),
      setTimeout(() => plant.clear("temp-hi", at(17)), 4000),
      setTimeout(
        () => plant.raise("fw-flow", { at: at(18), detail: "62 kg/s, limit 70 kg/s" }),
        6000,
      ),
    ];
    const timer = setInterval(() => setTick((t) => (t >= 40 ? 24 : t + 1)), 2000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(timer);
    };
  }, []);

  const data = useMemo(
    () =>
      Array.from({ length: tick }, (_, i) => ({
        time: minute(i),
        outlet: tripped && i > tick - 4 ? temperatureAt(i) - 40 : temperatureAt(i),
        inlet: Math.round((temperatureAt(i) - 28) * 10) / 10,
      })),
    [tick, tripped],
  );

  const tempState = plant.alarms.find((a) => a.id === "temp-hi")?.active ? "warning" : "normal";
  const nodes: SchematicNode[] = [
    {
      id: "core",
      kind: "vessel",
      x: 80,
      y: 130,
      label: "Reactor",
      value: `${data[data.length - 1].outlet} °C`,
      state: tripped ? "off" : tempState,
      tag: "RX",
    },
    { id: "sg", kind: "exchanger", x: 280, y: 70, label: "Steam generator", value: "6.9 MPa" },
    { id: "rcp-a", kind: "pump", x: 280, y: 180, label: "Pump A", value: "1 480 rpm" },
    {
      id: "rcp-b",
      kind: "pump",
      x: 200,
      y: 270,
      label: "Pump B",
      running: pumpB,
      state: pumpB ? "normal" : "alarm",
      value: pumpB ? "1 476 rpm" : "0 rpm",
    },
    { id: "msv", kind: "valve", x: 420, y: 70, label: "Steam valve", open: !tripped },
    {
      id: "turbine",
      kind: "turbine",
      x: 540,
      y: 70,
      label: "Turbine",
      value: tripped ? "0 MWe" : "77 MWe",
      state: tripped ? "off" : "normal",
    },
    { id: "tt", kind: "sensor", x: 130, y: 40, label: "Outlet temp", tag: "TT" },
  ];
  const links: SchematicLink[] = [
    {
      from: "core",
      to: "sg",
      via: [
        [80, 40],
        [280, 40],
      ],
      flow: tripped ? 0.2 : 1.2,
      label: "Hot leg",
    },
    { from: "sg", to: "rcp-a", flow: tripped ? 0.2 : 1, state: "normal" },
    { from: "rcp-a", to: "core", via: [[80, 180]], flow: tripped ? 0.2 : 1, label: "Cold leg" },
    {
      from: "rcp-b",
      to: "core",
      via: [
        [200, 180],
        [80, 180],
      ],
      flow: pumpB ? 0.8 : 0,
      state: pumpB ? "normal" : "alarm",
    },
    { from: "sg", to: "msv", flow: tripped ? 0 : 1.5, label: "Steam" },
    { from: "msv", to: "turbine", flow: tripped ? 0 : 1.5 },
  ];

  return (
    <Column
      fillWidth
      gap="24"
      padding="24"
      style={{ maxWidth: 1280, margin: "0 auto" }}
      data-testid="root"
    >
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Heading variant="heading-strong-l">Halden SMR · Unit 1</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {plant.counts.active} alarms standing, {plant.counts.unacknowledged} waiting
          </Text>
        </Column>
        <Row gap="8">
          <ConfirmButton
            mode="hold"
            label="Hold to silence horn"
            onConfirm={() => plant.acknowledgeAll()}
            data-testid="silence"
          />
          <ConfirmButton
            label={tripped ? "Reactor tripped" : "Manual trip"}
            labels={{ confirm: "Press again to trip" }}
            disabled={tripped}
            onConfirm={() => {
              setTripped(true);
              plant.raise("temp-trip", {
                at: new Date(START + (tick - 1) * 60_000),
                detail: "Manual trip",
              });
            }}
            data-testid="trip"
          />
        </Row>
      </Row>

      <Annunciator
        alarms={plant.alarms}
        onAcknowledge={plant.acknowledge}
        columns={4}
        data-testid="annunciator"
      />

      <Row fillWidth gap="24" wrap>
        <Column
          style={{ flex: "3 1 480px" }}
          minWidth={0}
          border="neutral-alpha-weak"
          radius="l"
          padding="16"
        >
          <Schematic
            nodes={nodes}
            links={links}
            aria-label="Primary and secondary loop"
            data-testid="schematic"
          />
        </Column>
        <Column
          style={{ flex: "2 1 320px" }}
          minWidth={0}
          border="neutral-alpha-weak"
          radius="l"
          overflow="hidden"
        >
          <AlarmList
            alarms={plant.alarms}
            onAcknowledge={plant.acknowledge}
            timeZone="UTC"
            data-testid="alarms"
          />
        </Column>
      </Row>

      <LineChart
        title="Core temperature"
        data={data}
        xKey="time"
        series={[
          { key: "outlet", label: "Outlet", color: "orange" },
          { key: "inlet", label: "Inlet", color: "cyan" },
        ]}
        valueFormat={{ style: "unit", unit: "celsius", maximumFractionDigits: 0 }}
        curve="monotone"
        yDomain={[240, 350]}
        thresholds={[
          { from: 340, label: "Trip", tone: "danger" },
          { value: 325, label: "High alarm", tone: "warning" },
          { from: 255, to: 275, label: "Inlet band", tone: "info", direction: "none" },
        ]}
        annotations={[{ x: "14:14", label: "Pump B trip", tone: "danger" }]}
        data-testid="chart"
      />
    </Column>
  );
}
