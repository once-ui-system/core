"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  SegmentedControl,
  StatusIndicator,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";
import { CountFx, RevealFx } from "@once-ui-system/fx";
/**
 * Gold example: dashboard
 * Target: KPI stat row, chart placeholders, recent activity table
 */
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Revenue", value: 128400, prefix: "$", change: "+12.4%", up: true },
  { label: "Active users", value: 2847, change: "+8.1%", up: true },
  { label: "Churn rate", value: 2.1, suffix: "%", change: "−0.3%", up: true },
  { label: "Support tickets", value: 34, change: "+4", up: false },
];

// Rows as arrays of cells: each column shows the cell at its position.
const activity = {
  columns: [
    { header: "Event", key: "event" },
    { header: "User", key: "user" },
    { header: "Status", key: "status" },
    { header: "Time", key: "time" },
  ],
  rows: [
    [
      "Plan upgraded to Pro",
      "jane@acme.co",
      <Tag size="s" tone="success">
        Completed
      </Tag>,
      "2m ago",
    ],
    [
      "New signup",
      "alex@studio.io",
      <Tag size="s" tone="brand">
        New
      </Tag>,
      "14m ago",
    ],
    [
      "Payment failed",
      "ops@build.dev",
      <Tag size="s" tone="danger">
        Action
      </Tag>,
      "1h ago",
    ],
  ],
};

export function DashboardExample() {
  const [range, setRange] = useState("7d");
  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" gap="40">
      <Column maxWidth="l" gap="40">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="24"
          s={{ direction: "column", horizontal: "start" }}
        >
          <Column gap="8">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              Analytics
            </Text>
            <Heading as="h1" textVariant="display-strong-s">
              Overview
            </Heading>
          </Column>
          <SegmentedControl
            value={range}
            onValueChange={setRange}
            buttons={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ]}
          />
        </Row>

        <Grid ref={statsRef} columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
          {stats.map((stat, index) => (
            <RevealFx key={stat.label} fill revealed={seen} translateY="8" delay={index * 100}>
              <Column background="surface" border radius="l" padding="24" gap="16">
                <Row fillWidth horizontal="between" vertical="center">
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    {stat.label}
                  </Text>
                  <StatusIndicator scheme={stat.up ? "green" : "orange"} />
                </Row>
                <Row vertical="end" gap="4">
                  {stat.prefix && <Text textVariant="display-strong-xs">{stat.prefix}</Text>}
                  <CountFx
                    textVariant="display-strong-xs"
                    value={seen ? stat.value : 0}
                    duration={1200}
                    separator=","
                  />
                  {stat.suffix && <Text textVariant="display-strong-xs">{stat.suffix}</Text>}
                </Row>
                <Text
                  textVariant="label-default-s"
                  onBackground={stat.up ? "success-medium" : "warning-medium"}
                >
                  {stat.change}
                </Text>
              </Column>
            </RevealFx>
          ))}
        </Grid>

        <Grid columns="2" gap="24" s={{ columns: 1 }}>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight="32rem">
            <Heading as="h2" textVariant="heading-strong-s">
              Revenue trend
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="linearGauge" size="l" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Chart area — use recharts or your data viz module
              </Text>
            </Column>
          </Column>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight="32rem">
            <Heading as="h2" textVariant="heading-strong-s">
              Signups by channel
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="radialGauge" size="l" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Chart area
              </Text>
            </Column>
          </Column>
        </Grid>

        <Column background="surface" border radius="l" padding="24" gap="24">
          <Row fillWidth horizontal="between" vertical="center">
            <Heading as="h2" textVariant="heading-strong-s">
              Recent activity
            </Heading>
            <Button variant="tertiary" size="s" label="View all" />
          </Row>
          <Line />
          <Table
            fillWidth
            aria-label="Recent activity"
            columns={activity.columns}
            rows={activity.rows}
          />
        </Column>
      </Column>
    </Column>
  );
}
